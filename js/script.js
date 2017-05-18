$(function(){

    var shell = require('shell');
    var fs = require('fs');

    function extractChords(song) {
        
        function buildChordObject(lineArray){
            return { "charPosition": lineArray[0], "lineNumber": lineArray[1], "chord": lineArray[2] };
        }

        function writeChordsIntoArray(rawChords) {
            var linesArray = [];
            var lines = rawChords.split('\r');
            lines.forEach(function(line){
                linesArray.push(buildChordObject(line.split(',')));
            });
            return linesArray;
        }

        var guitarChords = "" + /(#Chord).+/g.exec(song);
        guitarChords = guitarChords.replace(/(#Chords=)/g,'');
        guitarChords = guitarChords.replace(/(,#Chord)/g,'');
        rawChords = new Buffer(guitarChords, 'base64').toString('utf8');
        var arrayOfChordObjects = writeChordsIntoArray(rawChords);
        return arrayOfChordObjects;
    };

    fs.readFile(__dirname + '/input.sng', 'binary', function(err, contents){
        if (err) { return console.log(err); }
        var totalOutput = contents;
        var chords = "";
        extractChords(contents).forEach(function (el){
            chords += JSON.stringify(el) + '<br>';
        });
        
        
        $('#partial-output').html(chords);
        $('#total-output').html(totalOutput.replace(/(?:\r\n|\r|\n)/g, '<br />'));
    });
});