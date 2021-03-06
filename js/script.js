$(function () {

    var shell = require('shell');
    var fs = require('fs');

    var rawFile = "";
    var song = {}
    var chordPro = {};
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

            function buildParsableMetaDataString(metaDataStringRaw) {
                var lines = metaDataStringRaw.match(/#.*/g)
                var arrayOfMetaDataLines = lines.map(buildStringFromMetaDataLine);
                return metaDataString = '{' + arrayOfMetaDataLines.toString() + '}';
            }

            function buildArrayOfChordObjects(metaDataObject) {

                function convertBase64ChordsInto(encoding) {
                    return new Buffer(metaDataObject.Chords, 'base64').toString(encoding)
                }

                function buildChordObject(lineArray) {
                    return { "charPosition": lineArray[0], "lineNumber": lineArray[1], "chord": unescape(encodeURIComponent(lineArray[2])) };
                }

                function buildChordObjectsArrayFrom(songbeamerChords) {
                    var linesArray = [];
                    var lines = songbeamerChords.split('\r');
                    lines.forEach(function (line) {
                        if (line) linesArray.push(buildChordObject(line.split(',')));
                    });
                    return linesArray;
                }

                function sortChordObjectsArray(a, b) {
                    if (parseInt(a.lineNumber) == parseInt(b.lineNumber)) return parseInt(a.charPosition) - parseInt(b.charPosition);
                    else return parseInt(a.lineNumber) - parseInt(b.lineNumber);
                }

                function makeChordLineNumbersSequential(chords) {
                    // Songbeamer includes also empty lines in the line numbers of chords. This removes them.
                    function buildOffsetArray(chords) {
                        var offsetArray = [0];
                        chords.forEach(function (chord, i) {
                            var prevElement = chords[i - 1];
                            if (prevElement) {
                                var actualLineNumber = parseInt(chord.lineNumber);
                                var previousLineNumber = parseInt(prevElement.lineNumber);
                                var lastOffset = offsetArray[offsetArray.length - 1]
                                if (previousLineNumber - actualLineNumber >= -1) offsetArray.push(lastOffset);
                                else offsetArray.push(previousLineNumber - actualLineNumber + 1 + lastOffset);
                            }
                        });
                        return offsetArray;
                    }

                    function addOffsetArrayToGetSequentialNumberedChordsArray(chords, offsetArray) {
                        sequentialNumberedChordsArray = [];
                        function integrateOffsetIntoLineNumber(chord, i) {
                            var newChord = cloneObject(chord);
                            newChord.lineNumber = parseInt(chord.lineNumber) + offsetArray[i];
                            sequentialNumberedChordsArray.push(newChord);
                        }
                        chords.forEach(integrateOffsetIntoLineNumber);
                        return sequentialNumberedChordsArray;
                    }
                    // First calculates an Array with negative offsets and then adds those offsets to 
                    // the corresponding line numbers to get sequential line numbers w/o empty lines
                    return addOffsetArrayToGetSequentialNumberedChordsArray(chords, buildOffsetArray(chords));
                }

                metaDataObject.Chords = convertBase64ChordsInto('utf8');
                metaDataObject.Chords = buildChordObjectsArrayFrom(metaDataObject.Chords);
                metaDataObject.Chords.sort(sortChordObjectsArray);
                metaDataObject.Chords = makeChordLineNumbersSequential(metaDataObject.Chords);

                return metaDataObject;

            }

            var metaDataObject = JSON.parse(buildParsableMetaDataString(metaDataStringRaw));
            metaDataObject = buildArrayOfChordObjects(metaDataObject);

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
                songPartArray.push(singleLanguageLines);
            }
            return songPartArray;
        }

        function buildSongPartsObjectsArray(songPartsArray) {
            var songPartObjects = [];
            songPartsArray.forEach(part => songPartObjects.push(buildSongPartObject(part)));
            return songPartObjects;
        }

        function getSongPartsArray(fileData) {
            return fileData.replace(/([^-]--\r\n)|([^-]---\r\n)/g, '---').split('---').splice(1);
        }

        function buildSongTextArray(songPartsObjectsArray) {
            var songTextArray = [];
            for (var i = 0; i < numberOfLanguages; i++) {
                var languagePartsArray = [];
                songPartsObjectsArray.forEach(partArray => languagePartsArray.push(partArray[i]));
                songTextArray.push(languagePartsArray);
            }
            return songTextArray;
        }

        var songPartsArray = getSongPartsArray(fileData);
        var songPartsObjectsArray = buildSongPartsObjectsArray(songPartsArray);
        return buildSongTextArray(songPartsObjectsArray);
    }

    function separateChordsIntoLanguages(song) {
        function initializeSeparatedChordsArray() {
            var separatedChords = []
            for (var i = 0; i < song.metaData.LangCount; i++) {
                separatedChords[i] = [];
            }
            return separatedChords;
        }

        function fillSeparatedChordsArray(chord) {
            if (chord.lineNumber !== undefined) separatedChords[parseInt(chord.lineNumber) % song.metaData.LangCount].push(chord);
        }

        var separatedChords = initializeSeparatedChordsArray();
        song.metaData.Chords.forEach(fillSeparatedChordsArray);
        return separatedChords;
    }

    function pairingChordsWithSongTextsByLanguage(song) {
        var chordAndTextObjectsArray = [];

        for (var i = 0; i < song.metaData.LangCount; i++) {
            chordAndTextObjectsArray.push(songLanguageObject = {
                'chords': song.metaData.Chords[i],
                'songText': song.songTexts[i]
            });
        }

        delete song.metaData.Chords;
        song.songTexts = chordAndTextObjectsArray;
        // JSONstringify(song);
        return song;

    }

    function integratingChordsIntoSongTexts(song) {

        function concatenateSongLines(song) {

            for (var langNr = 0; langNr < song.metaData.LangCount; langNr++) {
                var concatenatedSingleLanguageLines = [];
                song.songTexts[langNr].songText.forEach(part => part.forEach(line => concatenatedSingleLanguageLines.push(line)));
                song.songTexts[langNr].songText = concatenatedSingleLanguageLines;
            }
            return song;
        }


        function integrateChords(song) {

            var newChordProSongTexts = [];
            function integrateChordsIntoSingleChordProSongText(chordAndTextObject) {
                chordProTextLinesArray = chordAndTextObject.songText

                function addChordToLine(chord) {
                    var lineNumber = Math.floor(parseInt(chord.lineNumber) / song.metaData.LangCount);
                    var line = chordProTextLinesArray[lineNumber];

                    function calculateOffsetBecauseOfAlreadyInsertedChords(line) {
                        if (line === undefined) {
                            console.error("Line undefined: " + line);
                        }
                        var offset = 0;
                        while (line.indexOf('[') > -1 && line.indexOf(']') > -1) {
                            offset += line.substring(line.indexOf('['), line.indexOf(']') + 1).length;
                            line = line.replace(line.slice(line.indexOf('['), line.indexOf(']') + 1), '');
                        }
                        return offset;
                    }

                    var insertPosition = calculateOffsetBecauseOfAlreadyInsertedChords(line) + Math.floor(chord.charPosition);
                    line = [line.slice(0, insertPosition), '[' + chord.chord + ']', line.slice(insertPosition)].join('');
                    chordProTextLinesArray[lineNumber] = line;

                }

                chordAndTextObject.chords.forEach(addChordToLine);
                newChordProSongTexts.push(chordProTextLinesArray);
            }

            song.songTexts.forEach(integrateChordsIntoSingleChordProSongText);
            song.songTexts = newChordProSongTexts;
            return song;

        }

        song = concatenateSongLines(song);
        song = integrateChords(song)
        return song;
    }

    function integratingMetaData(song) {

        var songTexts = [];

        function integrateIntoSingleLanguage(songTextArray, languageNumber) {

            function handleMatchingDirectives(property) {
                var songbeamerDirectives = ['Title', 'Author', 'Melody', '(c)'];
                if (languageNumber > 0) {
                    // prepares matching different language titles to title directive
                    songbeamerDirectives[0] = 'TitleLang' + (languageNumber + 1);
                }
                var chordProDirectives = ['title', 'lyricist', 'composer', 'copyright'];
                var indexOfDirective = songbeamerDirectives.indexOf(property);
                if (indexOfDirective > - 1) {
                    return '{' + chordProDirectives[indexOfDirective] + ': ' + song.metaData[property] + '}';
                } else {
                    return '{x_' + property + ': ' + song.metaData[property] + '}';
                }
            }

            function buildSingleLanguageChordProArray(songTextArray) {
                var singleLanguageChordProArray = [];
                for (var property in song.metaData) {
                    singleLanguageChordProArray.push(handleMatchingDirectives(property));
                }
                singleLanguageChordProArray.push('');
                return singleLanguageChordProArray.concat(songTextArray);
            }

            songTexts.push(buildSingleLanguageChordProArray(songTextArray));
        }

        song.songTexts.forEach(integrateIntoSingleLanguage);
        song = songTexts; // removes metadata, returns array of songs by language

        return song;
    }

    function puttingSongTogether(songs) {

        var songsArray = [];

        function addCorrectLineEndings(song) {
            var songString = song.reduce((returnString, line) => { return returnString + line.replace('\r', '') + '\r'; }, '');
            songsArray.push(songString);
        }

        songs.forEach(addCorrectLineEndings)

        return songsArray;
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

        displayArrayOfObjects(song);
        // displayArrayOfObjects([song.metaData]);
        // displayArrayOfObjects(song.songTexts);
        $('#total-output').html(rawFile);
    }

    function buildSong(fileData) {
        var song = {};
        song.metaData = extractMetaData(fileData);
        song.songTexts = extractSongTextObject(fileData, parseInt(song.metaData.LangCount));
        song.metaData.Chords = separateChordsIntoLanguages(song);
        song = pairingChordsWithSongTextsByLanguage(song);
        song = integratingChordsIntoSongTexts(song);
        song = integratingMetaData(song);
        song = puttingSongTogether(song);
        return song;
    }

    function getDirectiveValueFromSong(singleSong, directive) {
        var value = '';
        singleSong.split('}').forEach(line => {
            if (line.substring(line.indexOf('{') + 1, line.indexOf(':')) == directive) {
                value = line.substring(line.indexOf(':') + 2);
            }
        });
        return value;
    }

    function exportSong(song) {
        song.forEach(singleSong => {
            var fileName = getDirectiveValueFromSong(singleSong, 'title').replace(/\s/g, '_') + '.chordpro';
            fs.writeFile(fileName, singleSong, (err) => {
                if (err) throw err;
                console.log('Successfully exported song to ' + fileName)
            });
        })
    }

    fs.readFile(__dirname + '/input.sng', 'binary', function (err, fileData) {
        if (err) { return console.log(err); }
        rawFile = fileData;
        song = buildSong(fileData);
        exportSong(song);

        if (measurePerformance) song = measurePerformanceOfFunction(buildSong, fileData);
        displayData();
    });
});