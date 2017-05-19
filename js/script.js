$(function () {

    var shell = require('shell');
    var fs = require('fs');

    var chordObjects = [];
    var songPartObjects = [];
    var metaData = [];

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
            var languages = [];
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

    function extractMetaData(song) {

        function getMetaDataPart(song) {
            return song.replace(/([^-]--\r\n)|([^-]---\r\n)/g, '---').split('---').splice(0, 1).toString();
        }

        function buildMetaDataObject(metaDataStringRaw) {

            function buildStringFromMetaDataLine(line) {
                var lineArray = line.replace('#', '').split('=');
                return '"' + lineArray[0] + '": "' + lineArray[1] + '"';
            };

            var lines = metaDataStringRaw.match(/#.*/g)
            var arrayOfMetaDataLines = lines.map(buildStringFromMetaDataLine);
            var metaDataString = '{' + arrayOfMetaDataLines.toString() + '}';
            return JSON.parse(metaDataString);
        }

        return buildMetaDataObject(getMetaDataPart(song));;
    }

    function displayData(fileData) {

        function displayArrayOfObjects(array) {
            var returnString = "";
            array.forEach(function (el) {
                returnString += JSON.stringify(el) + '<br>';
            });
            $('#partial-output').html(returnString);
        }

        // displayArrayOfObjects(chordObjects);
        // displayArrayOfObjects(songPartObjects);
        displayArrayOfObjects([metaData]);
        $('#total-output').html(fileData.replace(/(?:\r\n|\r|\n)/g, '<br />'));
    }

    fs.readFile(__dirname + '/input.sng', 'binary', function (err, fileData) {
        if (err) { return console.log(err); }
        chordObjects = extractChordObjects(fileData);
        songPartObjects = extractSongPartObjects(fileData);
        metaData = extractMetaData(fileData);
        displayData(fileData);
    });
});