$(function () {

    var shell = require('shell');
    var fs = require('fs');

    var rawFile = "";
    var chordObjects = [];
    var songPartObjects = [];
    var metaData = [];
    var measurePerformance = false;

    function extractMetaData(song) {

        function getMetaDataPart(song) {
            return song.replace(/([^-]--\r\n)|([^-]---\r\n)/g, '---').split('---').splice(0, 1).toString();
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

        return buildMetaDataObject(getMetaDataPart(song));;
    }

    function extractSongPartObjects(song) {

        function buildSongPartObject(songPart) {
            var songPartArray = []
            var numberOfLanguages = parseInt(metaData.LangCount);
            var totalLines = songPart.match(/.*\r/g);
            for (var langNr = 0; langNr < numberOfLanguages; langNr++) {
                var singleLanguageLines = [];
                for (var lineNr = langNr; lineNr < totalLines.length; lineNr += numberOfLanguages) {
                    singleLanguageLines.push(totalLines[lineNr]);
                }
                songPartArray.push(singleLanguageLines.toString());
            }
            return songPartArray;
        }

        function buildSongPartsObectsArray(song) {
            var songPartObjects = [];
            song.forEach(part => songPartObjects.push(buildSongPartObject(part)));
            return songPartObjects;
        }

        function getSongPartsArray(song) {
            return song.replace(/([^-]--\r\n)|([^-]---\r\n)/g, '---').split('---').splice(1);
        }

        song = getSongPartsArray(song);
        return buildSongPartsObectsArray(song);
    }

    function displayData() {

        function displayArrayOfObjects(array) {
            var returnString = "";
            array.forEach(function (el) {
                returnString += JSON.stringify(el) + '<br>';
            });
            $('#partial-output').html(returnString);
        }

        displayArrayOfObjects(songPartObjects);
        // displayArrayOfObjects([metaData]);
        $('#total-output').html(rawFile.replace(/(?:\r\n|\r|\n)/g, '<br />'));
    }

    function measurePerformanceOfFunction(functionToMeasure, functionParameter) {
        var loop = 1000;
        var sum = 0;
        for (var i = 0; i <= loop; i++) {
            var t0 = performance.now();
            functionToMeasure(functionParameter);
            var t1 = performance.now();
            if (i !== 0) sum += (t1 - t0);
        }

        console.log('Average time of ' + functionToMeasure.name + ': ', (sum / loop).toFixed(4), 'milliseconds');
        return functionToMeasure(functionParameter);
    }

    fs.readFile(__dirname + '/input.sng', 'binary', function (err, fileData) {
        if (err) { return console.log(err); }
        rawFile = fileData;
        metaData = extractMetaData(fileData);
        songPartObjects = extractSongPartObjects(fileData);
        if (measurePerformance) {
            metaData = measurePerformanceOfFunction(extractMetaData, fileData);
            chordObjects = measurePerformanceOfFunction(extractChordObjects, fileData);
            songPartObjects = measurePerformanceOfFunction(extractSongPartObjects, fileData);
        }
        displayData();
    });
});