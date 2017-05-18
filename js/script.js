$(function () {

    var shell = require('shell');
    var fs = require('fs');

    var chordObjects = [];

    function extractChordObjects(song) {

        function buildChordObject(lineArray) {
            return { "charPosition": lineArray[0], "lineNumber": lineArray[1], "chord": lineArray[2] };
        }

        function writeChordsIntoArray(songBeamerChords) {
            var linesArray = [];
            var lines = songBeamerChords.split('\r');
            lines.forEach(function (line) {
                linesArray.push(buildChordObject(line.split(',')));
            });
            return linesArray;
        }

        function extractSongBeamerChords(song) {
            var guitarChords = "" + /(#Chord).+/g.exec(song);
            guitarChords = guitarChords.replace(/(#Chords=)/g, '');
            guitarChords = guitarChords.replace(/(,#Chord)/g, '');
            return new Buffer(guitarChords, 'base64').toString('utf8');
        }

        var songBeamerChords = extractSongBeamerChords(song);
        var arrayOfChordObjects = writeChordsIntoArray(songBeamerChords);
        return arrayOfChordObjects;
    };

    function displayData(fileData) {

        function displayChordObjects(chordObjects) {
            var chords = "";
            chordObjects.forEach(function (el) { // only for output
                chords += JSON.stringify(el) + '<br>';
            });
            $('#partial-output').html(chords);
        }

        displayChordObjects(chordObjects)
        $('#total-output').html(fileData.replace(/(?:\r\n|\r|\n)/g, '<br />'));
    }

    fs.readFile(__dirname + '/input.sng', 'binary', function (err, fileData) {
        if (err) { return console.log(err); }
        chordObjects = extractChordObjects(fileData);
        displayData(fileData)
    });
});