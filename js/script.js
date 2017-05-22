$(function () {

    var shell = require('shell');
    var fs = require('fs');

    var rawFile = "";
    var song = {}
    var chordProObject = {}
    var measurePerformance = false;

    function extractMetaData(fileData) {

        function getMetaDataPart(fileData) {
            return fileData.replace(/([^-]--\r\n)|([^-]---\r\n)/g, '---').split('---').splice(0, 1).toString();
        }

        function buildMetaDataObject(metaDataStringRaw) {

            function buildStringFromMetaDataLine(line) {
                var lineArray = line.replace('#', '').split('=');
                return '"' + lineArray[0] + '": "' + lineArray[1] + '"';
            };

            function buildParseableMetaDataString(metaDataStringRaw) {
                var lines = metaDataStringRaw.match(/#.*/g)
                var arrayOfMetaDataLines = lines.map(buildStringFromMetaDataLine);
                return metaDataString = '{' + arrayOfMetaDataLines.toString() + '}';
            }

            function buildArrayOfChordObjects(metaDataObject) {

                function convertBase64ChordsInto(encoding) {
                    return new Buffer(metaDataObject.Chords, 'base64').toString(encoding)
                }

                function buildChordObject(lineArray) {
                    return { "charPosition": lineArray[0], "lineNumber": lineArray[1], "chord": lineArray[2] };
                }

                function buildChordObjectsArrayFrom(songBeamerChords) {
                    var linesArray = [];
                    var lines = songBeamerChords.split('\r');
                    lines.forEach(function (line) {
                        linesArray.push(buildChordObject(line.split(',')));
                    });
                    return linesArray;
                }

                metaDataObject.Chords = convertBase64ChordsInto('utf8');
                metaDataObject.Chords = buildChordObjectsArrayFrom(metaDataObject.Chords);
                return metaDataObject;

            }

            var metaDataObject = JSON.parse(buildParseableMetaDataString(metaDataStringRaw));
            metaDataObject =  buildArrayOfChordObjects(metaDataObject);

            return metaDataObject;
        }

        return buildMetaDataObject(getMetaDataPart(fileData));;
    }

    function extractSongTextObject(fileData, numberOfLanguages) {
        function buildSongPartObject(songPart) {
            var songPartArray = []
            var totalLines = songPart.match(/.*\r/g);
            for (var langNr = 0; langNr < numberOfLanguages; langNr++) {
                var singleLanguageLines = [];
                for (var lineNr = langNr; lineNr < totalLines.length; lineNr += numberOfLanguages) {
                    singleLanguageLines.push(totalLines[lineNr]);
                }
                songPartArray.push(singleLanguageLines.join(''));
            }
            return songPartArray;
        }

        function buildSongPartsObectsArray(songPartsArray) {
            var songPartObjects = [];
            songPartsArray.forEach(part => songPartObjects.push(buildSongPartObject(part)));
            return songPartObjects;
        }

        function getSongPartsArray(fileData) {
            return fileData.replace(/([^-]--\r\n)|([^-]---\r\n)/g, '---').split('---').splice(1);
        }

        function buildSongTextArray(songPartsObectsArray) {
            var songTextArray = [];
            for (var i = 0; i < numberOfLanguages; i++) {
                var languagePartsArray = [];
                songPartsObectsArray.forEach(partArray => languagePartsArray.push(partArray[i]));
                songTextArray.push(languagePartsArray);
            }
            return songTextArray;
        }

        var songPartsArray = getSongPartsArray(fileData);
        var songPartsObectsArray = buildSongPartsObectsArray(songPartsArray);
        return buildSongTextArray(songPartsObectsArray);
    }

    function displayData() {

        function displayArrayOfObjects(array) {
            var returnString = "";
            array.forEach(function (el) {
                returnString += JSON.stringify(el);
                JSONstringify(el);
            });
            $('#partial-output').html(returnString.replace(/(\\r\\n|\\r|\\n)/g, '<br />'));
        }

        displayArrayOfObjects([song]);
        // displayArrayOfObjects([song.metaData]);
        // displayArrayOfObjects(song.songTexts);
        $('#total-output').html(rawFile);
    }

    function buildSong(fileData) {
        var song = {};
        song.metaData = extractMetaData(fileData);
        song.songTexts = extractSongTextObject(fileData, parseInt(song.metaData.LangCount));
        return song;
    }

    fs.readFile(__dirname + '/input.sng', 'binary', function (err, fileData) {
        if (err) { return console.log(err); }
        rawFile = fileData;
        song = buildSong(fileData);

        if (measurePerformance) {
            song = measurePerformanceOfFunction(buildSong, fileData);
        }
        displayData();
    });
});