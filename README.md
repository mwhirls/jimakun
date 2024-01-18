[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![stability-wip](https://img.shields.io/badge/stability-wip-lightgrey.svg)](https://github.com/mkenney/software-guides/blob/master/STABILITY-BADGES.md#work-in-progress)

# Jimakun
A Chrome Extension that enhances Japanese subtitles on Netflix for language learning.

## Table of Contents

* [About](#about)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Building](#building)
  * [Installation](#installation)
* [How to Use](#how-to-use)
* [Completed Features](#completed-features)
* [Planned Features](#planned-features)
* [FAQ](#faq)
* [License](#license)

## About

Jimakun is a Chrome Extension that enhances Japanese subtitles on Netflix for language learning.  

As someone learning Japanese as a foreign language, a large part of my study comes from watching Japanese television shows with Japanese subtitles enabled.  Unfortunately, it can be difficult to find videos that have Japanese subtitles in the first place, and often if they <i>do</i> happen to be there, the subtitles are not interactive and may even be rendered as image files.  This is very problematic as a language learner because unknown words in the subtitles cannot be selected for easy copy-and-paste into a dictionary or for use with a pop-up dictionary.

Additionally, normal subtitles are missing a number of features that enhance the language learning process, such as: 
* Looking up the meaning of a word at the click of a button.
* The ability to easily toggle a translation (i.e. English) to check your understanding.
* Displaying the reading of a word written in Chinese characters (kanji).
* Replaying a single piece of dialogue.
* Saving sentences for later study (a process known as sentence mining).

The goal of this extension is to transform Netflix into a helpful resource for Japanese study by adding several features to the existing Japanese subtitles on Netflix.

I'm not the first to provide this kind of web app and will likely not be the last.  This extension was inspired by those that came before it, such as [Language Reactor](https://www.languagereactor.com/) and [Subadub](https://chrome.google.com/webstore/detail/subadub/jamiekdimmhnnemaaimmdahnahfmfdfk?hl=en-US).

## Status

Jimakun is currently in development.  It has not been released on the Chrome Store yet.  If you would like to experiment with a developer build, please follow the instructions outlined in [Getting Started](#getting-started).

## Getting Started

Building the project locally and installing a developer build requires a few simple steps.

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

### Installation

A developer build of the extension can be installed by enabling Developer Mode in the Chrome browser and loading it as an unpacked extension.  To do so:

1. Open Google Chrome.

2. Open the Extension Management page by either:
    * Navigating to chrome://extensions, or 
    * By clicking through Menu > More Tools > Extensions in the upper right of the browser.

3. Enable Developer Mode by clicking the toggle switch in the upper-right.

4. Click the `LOAD UNPACKED` button and select the built `dist/` directory. 

![](docs/installation.png)

## How to Use

Note that in order to use Jimakun, you must have a Netflix subscription.  Assuming that you do:

1. Navigate to [Netflix](https://www.netflix.com/browse) in the Chrome browser.
2. Open a show with Japanese subtitles.
3. Click the Jimakun control button in the Netflix control bar.
4. Plain text Japanese subtitles (if present) will begin rendering and can now be selected or used with pop-up dictionaries.
    * While active, the native Netflix subtitles will be disabled.

![](docs/extension_usage.png)

### Hotkeys
* Ctrl/Cmd + Up: Repeat the current subtitle
* Ctrl/Cmd + Left = Jump to the previous subtitle
* Ctrl/Cmd + Right = Jump to the next subtitle
* Alt + S = Show/hide subtitles

## Completed Features
* Segmenting Japanese subtitles into clickable words
* Hotkeys to jumping to the next or previous subtitle or repeat the current subtitle
* Hotkey to toggling subtitles on/off
* Displaying furigana when hovering over words
* Integrated pop-up dictionary on word click including:
    * Japanese-English definitions from JMDict
    * Kanji information from KanjiDic2
    * Example sentences from Tatoeba

## Planned Features

Jimakun is currently in development.  An (incomplete) list of planned features includes:

* A "note-taking" feature, where users can add notes for each word
* A "download" button, where users can export a sentence as an Anki card
* Bookmark button to save words to a list
* Export of subtitle data for an episode as an .srt or plain text file
* Automatic highlighting of common words
* ...and more!

<!-- FAQ -->
## FAQ

1. Will Jimakun support multiple languages?

No.  Some of the features and service integrations I have in mind are planned specifically with Japanese in mind.  Bringing up multiple languages also has a technical cost associated with it, as sentence parsing and integrating dictionary support are language specific.  

Additionally, Japanese is the only language I'm studying, so frankly I don't have the insight nor the motivation currently to provide support for other languages.  

If you're interested in extensions that provide support for multiple languages, I recommend [Language Reactor](https://www.languagereactor.com/) and [Subadub](https://chrome.google.com/webstore/detail/subadub/jamiekdimmhnnemaaimmdahnahfmfdfk?hl=en-US).

2. Will there be a Firefox version?

Maybe.  After the Chrome version is reasonably feature complete, I'll look into supporting Firefox.

## License

### Icons

Several icons used by the plugin are sourced from the [Stratis UI Icons](https://www.figma.com/community/file/1177180791780461401) library on Figma, which is made available under the [CC BY 4.0 license][cc-by].

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: https://creativecommons.org/licenses/by/4.0/ 
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg

### Source Code
The original source code and other files in this project, excluding the files mentioned above, are made available under the GPLv3 license (see [LICENSE.txt](LICENSE.txt)).   