[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![stability-wip](https://img.shields.io/badge/stability-wip-lightgrey.svg)](https://github.com/mkenney/software-guides/blob/master/STABILITY-BADGES.md#work-in-progress)

# Jimakun
A Chrome Extension that enhances Japanese subtitles on Netflix for language learning.

## Table of Contents

* [About](#about)
* [Status](#status)
* [Installation](#installation)
* [How to Use](#how-to-use)
* [Completed Features](#completed-features)
* [Planned Features](#planned-features)
* [FAQ](#faq)
* [License](#license)

## About

Jimakun is a Chrome Extension that enhances Japanese subtitles on Netflix for language learning.  

Learning a Japanese through TV shows is an effective way to get exposure to authentic, native Japanese in a fun context. Unfortunately, it can be difficult to find videos that have Japanese subtitles in the first place, and often if they <i>do</i> happen to be there, the subtitles are not interactable and may even be rendered as image files.  This is very problematic as a language learner because unknown words in the subtitles cannot be selected for easy copy-and-paste into a dictionary or for use with a pop-up dictionary.

Additionally, normal subtitles are missing a number of features that enhance the language learning process, such as: 
* Looking up the meaning of a word at the click of a button.
* The ability to easily toggle a translation to check your understanding.
* Displaying the reading of a word written in Chinese characters (kanji).
* Replaying a single piece of dialogue.
* Saving sentences for later study (a process known as sentence mining).

The goal of this extension is to transform Netflix into a helpful resource for Japanese study by adding several features to the existing Japanese subtitles on Netflix.

I'm not the first to provide this kind of web app and will likely not be the last.  This extension was inspired by those that came before it, such as [Language Reactor](https://www.languagereactor.com/) and [Subadub](https://chrome.google.com/webstore/detail/subadub/jamiekdimmhnnemaaimmdahnahfmfdfk?hl=en-US).

## Status

Jimakun is currently in development.  It has not been released on the Chrome Store yet.  If you would like to experiment with a developer build, you can download the latest percheckin build from the [Actions](https://github.com/mwhirls/jimakun/actions) page. Please follow the instructions outlined in [Installation](#installation).

## Installation

A build can be installed by enabling Developer Mode in the Chrome browser and loading it as an unpacked extension.  

1. Download the latest percheckin zip from the latest build under [Actions](https://github.com/mwhirls/jimakun/actions) and extract it.

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
* [python](https://www.python.org/)
* The latest version of [Google Chrome](https://www.google.com/chrome/).

### Building

1. Grab the submodules
```sh
git submodule update --init --recursive
```
2. Install NPM package dependencies.
```sh
npm install
```
3. Run the build with npm.  This will generate a build located in the `dist/` folder.
```sh
npm run build
```

## How to Use

Note that in order to use Jimakun, you must have a Netflix subscription.  Assuming that you do:

1. Navigate to [Netflix](https://www.netflix.com/browse) in the Chrome browser.
2. Open a show with Japanese subtitles.
3. Turn on subtitles through the normal Netflix subtitle widget and switch to the Japanese ones.
4. When active, Jimakun will turn these subtitles into interactive, clickable ones with a popup dictionary.
    * If you would like to disable the Jimakun subtitles, you can either by clicking on the extension popup in the Chrome toolbox and toggling the Enabled switch, or navigating to Jimakun's settings page and doing the same, as shown below.

(TODO: insert images)

### Hotkeys
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

### kuromoji (through `bunsetsu`)

This project makes heavy use of another library I wrote, bunsetsu, for segmenting the Japanese sentences into words.  `bunsetsu` leverages the third-party morphological analyzer [kuromoji](https://github.com/takuyaa/kuromoji.js), which is licensed under the Apache 2.0 license. 

### heroicons

Several SVGs in the plugin are sourced from the [heroicons](https://heroicons.com/) library, which is made available under the MIT license.

### Stratis UI Icons

Some icons used by the plugin are sourced from the [Stratis UI Icons](https://www.figma.com/community/file/1177180791780461401) library on Figma, which is made available under the [CC BY 4.0 license][cc-by].

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: https://creativecommons.org/licenses/by/4.0/ 
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg

### Other

See NOTICE for a full list of third-party dependencies and their corresponding licenses.

### Source Code
The original source code and other files in this project, excluding the files mentioned above or in NOTICE, are made available under the GPLv3 license (see [LICENSE.txt](LICENSE.txt)).   