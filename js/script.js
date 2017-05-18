$(function () {

    var shell = require('shell');
    var fs = require('fs');

    function extractChordsObjects(song) {

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

    fs.readFile(__dirname + '/input.sng', 'binary', function (err, contents) {
        if (err) { return console.log(err); }

        var totalOutput = contents;
        var chords = "";
        extractChordsObjects(contents).forEach(function (el) { // only for output
            chords += JSON.stringify(el) + '<br>';
        });

        $('#partial-output').html(chords);
        $('#total-output').html(totalOutput.replace(/(?:\r\n|\r|\n)/g, '<br />'));
    });
});