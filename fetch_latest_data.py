#!/usr/bin/env python3
# Fetch the latest releases of the JSON-formatted dictionary and example sentences

from io import BytesIO
import re
import urllib.request
from zipfile import ZipFile
from string import Template
from pathlib import Path
import os
import argparse


class GithubAsset:
    def __init__(self, name, download_path, unzipped_path):
        self.name = name
        self.download_path = download_path
        self.unzipped_path = unzipped_path

    def resolved_name(self, release_tag):
        return Template(self.name).substitute(tag=release_tag)

    def downloaded(self):
        return Path(self.download_path).is_file()

    def unzipped(self):
        return Path(self.unzipped_path).is_file()


class GithubRelease:
    def __init__(self, repo, target_assets):
        self.repo = repo
        self.target_assets = target_assets

    def downloaded(self):
        return all(asset.downloaded() for asset in self.target_assets)

    def unzipped(self):
        return all(asset.unzipped() for asset in self.target_assets)


RELEASES = [
    GithubRelease(
        "https://github.com/scriptin/jmdict-simplified",
        [
            GithubAsset(
                "jmdict-eng-$tag.json.zip",
                "third-party/jmdict-simplified/jmdict-eng.zip",
                "public/jmdict-simplified/jmdict-eng.json",
            )
        ],
    ),
    GithubRelease(
        "https://github.com/scriptin/jmdict-simplified",
        [
            GithubAsset(
                "kanjidic2-en-$tag.json.zip",
                "third-party/jmdict-simplified/kanjidic2-en.zip",
                "public/jmdict-simplified/kanjidic2-en.json",
            )
        ],
    ),
    GithubRelease(
        "https://github.com/mwhirls/tanaka-corpus-json",
        [
            GithubAsset(
                "jpn-eng-examples.zip",
                "third-party/tanaka-corpus-json/jpn-eng-examples.zip",
                "public/tanaka-corpus-json/jpn-eng-examples.json",
            ),
        ],
    ),
]


def download_latest(release):
    release_path = f"{release.repo}/releases"
    with urllib.request.urlopen(f"{release_path}/latest/") as response:
        m = re.match(".*\/releases\/tag\/(?P<tag>.*)$", response.url)
        release_tag = m.group("tag")
        for asset in release.target_assets:
            asset_name = asset.resolved_name(release_tag)
            target_url = f"{release_path}/download/{release_tag}/{asset_name}"
            with urllib.request.urlopen(target_url) as zipresp:
                zipb = BytesIO(zipresp.read())
                dest = asset.download_path
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                with open(dest, "wb") as f:
                    f.write(zipb.getbuffer())


def unzip(release):
    for asset in release.target_assets:
        zip_path = Path(asset.download_path)
        dest = Path(asset.unzipped_path)
        with ZipFile(zip_path.absolute()) as zfile:
            names = zfile.namelist()
            assert len(names) == 1, "expected single zipped file"
            filename = names[0]
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "wb") as unzipped_file:
                unzipped_file.write(zfile.read(filename))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process some integers.")
    parser.add_argument(
        "-o",
        "--overwrite",
        action="store_true",
        help="Forcibly overwrite any local copies of the downloaded data with the latest version",
    )
    args = parser.parse_args()

    for release in RELEASES:
        if args.overwrite:
            download_latest(release)
            unzip(release)
        else:
            if not release.downloaded():
                download_latest(release)
                unzip(release)
            elif not release.unzipped():
                unzip(release)
