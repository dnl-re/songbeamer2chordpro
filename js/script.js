// Mixing jQuery and Node.js code in the same file? Yes please!

$(function(){

    // Display some statistics about this computer, using node's os module.

    var os = require('os');
    var prettyBytes = require('pretty-bytes');

    // $('.stats').append('Number of cpu cores: <span>' + os.cpus().length + '</span>');
    // $('.stats').append('Free memory: <span>' + prettyBytes(os.freemem())+ '</span>');

    // Electron's UI library. We will need it for later.

    var shell = require('shell');
    var fs = require('fs');



    function extractChords(song) {

        function writeChordsIntoArray(rawChords) {
            var linesArray = [];
            var lines = rawChords.split('\r');
            lines.forEach(function(line){
                var lineArray = line.split(',');
                var chordObject = {
                    "charPosition": lineArray[0],
                    "lineNumber": lineArray[1],
                    "chord": lineArray[2]
                };
                linesArray.push(chordObject)
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





    /*
    // Fetch the recent posts on Tutorialzine.

    var ul = $('.flipster ul');

    // The same-origin security policy doesn't apply to electron, so we can
    // send ajax request to other sites. Let's fetch Tutorialzine's rss feed:

    $.get('http://feeds.feedburner.com/Tutorialzine', function(response){

        var rss = $(response);

        // Find all articles in the RSS feed:

        rss.find('item').each(function(){
            var item = $(this);
            
            var content = item.find('encoded').html().split('</a></div>')[0]+'</a></div>';
            var urlRegex = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g;

            // Fetch the first image of the article.
            var imageSource = content.match(urlRegex)[1];


            // Create a li item for every article, and append it to the unordered list.

            var li = $('<li><img /><a target="_blank"></a></li>');

            li.find('a')
                .attr('href', item.find('link').text())
                .text(item.find("title").text());

            li.find('img').attr('src', imageSource);

            li.appendTo(ul);

        });

        // Initialize the flipster plugin.

        $('.flipster').flipster({
            style: 'carousel'
        });

        // When an article is clicked, open the page in the system default browser.
        // Otherwise it would open it in the electron window which is not what we want.

        $('.flipster').on('click', 'a', function (e) {

            e.preventDefault();
            
            // Open URL with default browser.

            shell.openExternal(e.target.href);

        });

    });*/

});