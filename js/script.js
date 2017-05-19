$(function () {

    var shell = require('shell');
    var fs = require('fs');

    var chordObjects = [];
    var songPartObjects = [{ a: "1" }, { b: "2" }];

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

    function extractSongPartObjects(song) {

        function buildSongPartObect(part) {
            return { part: part };
        }

        function buildSongPartsObect(song) {
            var songPartObjects = [];
            song.forEach(part => songPartObjects.push(buildSongPartObect(part)));
            return songPartObjects;
        }

        function getSongPartsArray(song) {
            return song.replace(/([^-]--\r\n)|([^-]---\r\n)/g, '---').split('---').splice(1);
        }

        song = getSongPartsArray(song);
        return buildSongPartsObect(song);
    }

    function displayData(fileData) {

        function displayChordObjects() {
            var chords = "";
            chordObjects.forEach(function (el) {
                chords += JSON.stringify(el) + '<br>';
            });
            $('#partial-output').html(chords);
        }

        function displaySongPartObjects() {
            var chords = "";
            songPartObjects.forEach(function (el) {
                chords += JSON.stringify(el) + '<br>';
            });
            $('#partial-output').html(chords);
            console.log(songPartObjects);
        }

        // displayChordObjects(chordObjects);
        displaySongPartObjects(songPartObjects);
        $('#total-output').html(fileData.replace(/(?:\r\n|\r|\n)/g, '<br />'));
    }

    fs.readFile(__dirname + '/input.sng', 'binary', function (err, fileData) {
        if (err) { return console.log(err); }
        chordObjects = extractChordObjects(fileData);
        songPartObjects = extractSongPartObjects(fileData);
        displayData(fileData);
    });
});