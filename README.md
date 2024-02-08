

<div align="center">
    <img alt="Jimakun" src="public/assets/app-icon.svg" width="50" height="50">
    <h1>Jimakun</h1>
</div>
<p align="center">
  Improve your Japanese by watching your favorite shows on Netflix.  Look up the meaning of unknown words in subtitles with a single click.
</p>
<div align="center">

  ![percheckin](https://github.com/mwhirls/jimakun/actions/workflows/build.yml/badge.svg?branch=main)
  [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
  [![stability-experimental](https://img.shields.io/badge/stability-experimental-orange.svg)](https://github.com/mkenney/software-guides/blob/master/STABILITY-BADGES.md#experimental)

</div>

## Table of Contents

* [About](#about)
* [Status](#status)
* [Installation](#installation)
* [How to Use](#how-to-use)
* [Feature List](#feature-list)
* [FAQ](#faq)
* [License](#license)

## About

Learning a Japanese through TV shows is a fun way to get exposure to authentic, native Japanese. Unfortunately, it can be difficult to find videos that have Japanese subtitles in the first place, and often if they <i>do</i> happen to be there, the subtitles are not interactable and may even be rendered as image files.  This is very problematic as a language learner because unknown words in the subtitles cannot be selected for easy copy-and-paste into a dictionary or for use with a pop-up dictionary.

Enter Jimakun.  The goal of Jimakun is to transform Netflix into a helpful resource for Japanese study by adding an integrated popup dictionary and tracking the words you're learning over time, all while staying completely free and open source.

## Status

Jimakun is currently in development.  It has not been released on the Chrome Store yet.  If you would like to experiment with a developer build, you can download the latest percheckin build from the [Actions](https://github.com/mwhirls/jimakun/actions) page. Please follow the installation instructions outlined in [Installation](#installation).

## Installation

A build can be installed by enabling Developer Mode in the Chrome browser and loading Jimakun as an unpacked extension.  

1. Download the latest percheckin zip (`jimakun-percheckin-v##.##.##.###.zip`) from the latest build under [Actions](https://github.com/mwhirls/jimakun/actions) and extract it.

2. Open Google Chrome.

3. Open the Extension Management page by either:
    * Navigating to chrome://extensions, or 
    * By clicking through Menu > More Tools > Extensions in the upper right of the browser.

4. Enable Developer Mode by clicking the toggle switch in the upper-right.

5. Click the `LOAD UNPACKED` button and select the extracted zip file.  
    * If building from source, select the built `dist/` folder.

![](docs/installation.png)

## For Developers

Building the project locally requires a few simple steps.

### Prerequisites

The following prerequisites are required to build and run the project:
* [npm](https://www.npmjs.com/get-npm) (>=10.x recommended)
* [python 3](https://www.python.org/)
* The latest version of [Google Chrome](https://www.google.com/chrome/).

### Building

1. Install Git LFS.
```sh
git lfs install
```
2. Grab the submodules.
```sh
git submodule update --init --recursive
```
3. Install NPM package dependencies.
```sh
npm install
```
3. Run the build with npm.  This will generate a build located in the `dist/` folder.
```sh
npm run build
```

## How to Use

⚠️ Note that you need a Netflix subscription to use Jimakun.

1. Navigate to [Netflix](https://www.netflix.com/browse) in the Chrome browser.
2. Open a show with Japanese subtitles.
3. Open the subtitle selector in the Netflix control panel in the lower-right and select "Japanese."
4. Have fun!  You should now be able to look up words in the Japanese subtitles with a single click.

![](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbm5qb2EybTFkMGxtcnJoNmgxb3c1dGNzb25qdmp0ejBhZXdqcjhsYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZR1Q6pJa9M7UyUHU9q/giphy.gif)

### Turning the Extension On/Off
If you would like to disable Jimakun's subtitles and re-enable the normal Japanese subtitles on Netflix, don't worry! You can do so either by clicking on the extension popup in the Chrome toolbar and toggling the Enabled switch, or navigating to Jimakun's settings page and doing the same.

### Words of Caution ⚠️

Jimakun isn't guaranteed to play nicely with other extensions that significantly alter the Netflix UI.  You may need to disable other Netflix extensions while using Jimakun for the best user experience.

### Hotkeys ⌨️
You can customize the following hotkeys by navigating to the [extension shortcuts page](chrome://extensions/shortcuts).  The default values are:
* Ctrl/Cmd + Up: Repeat the current subtitle
* Ctrl/Cmd + Left = Jump to the previous subtitle
* Ctrl/Cmd + Right = Jump to the next subtitle
* Alt + S = Show/hide subtitles

## Feature List

A list of completed features includes:
* Segmenting Japanese subtitles into clickable words
* Hotkeys for jumping to the next or previous subtitle or repeat the current subtitle
* Hotkey to toggle subtitles on/off
* Displaying furigana when hovering over words
* Integrated pop-up dictionary on word click including:
    * Japanese-English definitions from JMDict
    * Kanji information from KanjiDic2
    * Example sentences from Tatoeba
    * A word conjugation viewer that shows all of the intermediate forms for a conjugation (still experimental)

An (incomplete) list of planned features includes:

* A "note-taking" feature, where users can add notes for each word
* A "download" button, where users can export a sentence as an Anki card
* Bookmark button to save words to a list
* Export of subtitle data for an episode as an .srt or plain text file
* A sidebar UI that shows a clickable list of all subtitles in the current TV show/movie.
* Badges or highlighting to show common words / JLPT level / etc

## FAQ

1. Will Jimakun support multiple languages?

No.  Some of the features and service integrations I have in mind are planned specifically with Japanese in mind.  If you're interested in extensions that provide support for multiple languages, I recommend [Language Reactor](https://www.languagereactor.com/) and [Subadub](https://chrome.google.com/webstore/detail/subadub/jamiekdimmhnnemaaimmdahnahfmfdfk?hl=en-US).

2. Will there be a Firefox version?

Maybe, if there's enough support for it!

## License

The original source code and other files in this project, excluding the files mentioned below or in NOTICE, are made available under the GPLv3 license (see [LICENSE.txt](LICENSE.txt)).   

See [NOTICE.md](NOTICE.md) for a list of third-party dependencies and their corresponding licenses.  In addition to these, Jimakun uses of the following dependencies:

### kuromoji

This project makes heavy use of another library I wrote, [bunsetsu](https://github.com/mwhirls/bunsetsu), for segmenting the Japanese sentences into words.  [bunsetsu](https://github.com/mwhirls/bunsetsu) leverages the third-party morphological analyzer [kuromoji](https://github.com/takuyaa/kuromoji.js), which is licensed under the Apache 2.0 license. 

### JMDICT & KANJIDIC2

The Japanese-English dictionary entries (JMDICT) and kanji dictionary (KANJIDIC2) entries were source from the Electronic Dictionary Research and Development Group (EDRDG). The files are made available under a Creative Commons Attribution-ShareAlike Licence (V4.0).

The modified versions of these files that are distributed are sourced from [jmdict-simplified](https://github.com/scriptin/jmdict-simplified).

### Tatoeba Project

Many of the example sentences are originally sourced another project I wrote, [tatoeba-json](https://github.com/mwhirls/tatoeba-json), which distributes the Japanese-English examples sentences from the Tatoeba Project in another format. All files downloaded through the Tatoeba Project are licensed under the CC BY 2.0 FR license.  As required by the original license, all derived files containing example sentences distributed in each release are made available under the same license.

### Stratis UI Icons

Some icons used by the plugin are sourced from the [Stratis UI Icons](https://www.figma.com/community/file/1177180791780461401) library on Figma, which is made available under the [CC BY 4.0 license][cc-by].

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: https://creativecommons.org/licenses/by/4.0/ 
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg
