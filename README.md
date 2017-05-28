# README

This is an electron app in development. You can `git clone` it and start it with `npm install && npm start`.

## Goal
The purpose of this app is to convert all .sng files from Songbeamer to the more popular and open .chordpro format (version 5) that can easily be edited and displayed.

## How it works

It decodes the Songbeamer chords from base64 and integrates them line by line into the song text. It also takes all Songbeamer metadata and turns them as good as possible into ChordPro directives. The metadata that has no corresponding directive will still be included with the prefix `x_` (which will be ignored by every ChordPro parser) so that no metadata will be lost.

## Todo
* &#128504; handle Songbeamer TitleLangX directive
* &#128504; output new file(s) to .chordpro format
* &#10146; Integrate VueJS from electron template for frontend (see [github project](https://github.com/SimulatedGREG/electron-vue) and its [doc](https://simulatedgreg.gitbooks.io/electron-vue/content/en/))
* Make frontend for selecting input and output file (-path) and for song previewing
* Set up project building and unit testing on [Travis CI](https://travis-ci.org/)
* Write some unit tests
* investigate and decide how to handle different parts of a song like chorus, verses and bridges

## Resources

### Development
* [ChordPro "Specs"](http://www.chordpro.org/chordpro/v50.html)
* [ChordWP is a plugin to easily edit and publish ChordPro sheets on Wordpress](https://wordpress.org/plugins/chordwp/)
* [Scriptasaurus includes a JavaScrip Library for displaying ChordPro sheets](https://github.com/buzcarter/UkeGeeks)
* [WebChord turns ChordPro into HTML (open source)](http://webchord.sourceforge.net/)
* [Reference implementation of ChordPro standard - Tool turns ChordPro into sheets (successor of Chordii)](https://github.com/sciurius/chordpro)

### Editor
* [ChordSmith Song Sheet Editor](http://www.statistics101.net/chordsmith/)
* [SongBook ~20 €](http://linkesoft.de/songbook/order.html)

### Other interesting resources:
* [Many ChordPro Links](http://www.gfapps.com/support/chordprolinks/)
* [UkeGeeks Sheet converter (Tabs into ChordPro)](http://www.ukeskywalker.com/Tools)
* [Tab Compressor](http://www.ukeskywalker.com/Tools)
* [Bunch of christian songs - maybe write a converter for this too?](http://www.gospelmusic.org.uk/)

## Format (for dev purposes)

### Songbeamer MetaData

    "LangCount": "2",
    "Title": "Jesus, Du bleibst für immer gleich",
    "Author": "Raymond Badham",
    "Translation": "dt: Evie Sturm",
    "(c)": "2003 Hillsong Publishing",
    "Melody": "Raymond Badham",
    "Songbook": "Feiert Jesus 3_052",
    "AddCopyrightInfo": "fj3_052<br>deutsch_englisch",
    "Editor": "Songbeamer 2.25a",
    "Version": "3",
    "Format": "F/K//",
    "TitleFormat": "U",
    "TitleLang2": "Jesus The Same",
    "Bible": "Jesaja 9:5-6   Johannes 8:12   Römer 15:13"

### Relevant ChordPro Directives

    {new_song}
    {title}
    {subtitle}
    composer
    lyricist
    artist
    album
    copyright
    year
    key
    tempo

    {comment:text} 
    {start_of_verse} 
    {end_of_verse}
    {chorus} Indicates that the chorus must be played here. By default ChordPro treats this like {comment: Chorus}.

    {x_###: will be ignored with prefix _x} To facilitate using custom extensions for application specific purposes, any directive with a name starting with x_ should be completely ignored by applications 

### Converting

    Songbeamer -> ChordPro

    "Title" -> {title}
    "Author" -> {lyricist}
    "Melody" -> {composer}
    "(c)" -> {copyright}

    All other
    "#####" -> {x_#####}