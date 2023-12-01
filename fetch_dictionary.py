#!/usr/bin/env python3
# Fetch the latest release of the JSON-formatted dictionary from jmdict-simplified

from io import BytesIO
import re
import urllib.request
from zipfile import ZipFile
from string import Template
from pathlib import Path
import os

def lazy_unzip(zip_path, dest):
    with ZipFile(zip_path.absolute()) as zfile:
        names = zfile.namelist()
        assert len(names) == 1, "expected single zipped json file"
        dict_name = names[0]
        archive = Path(f'{dest}/{dict_name}')
        if not archive.is_file():
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "wb") as unzipped_file:
                unzipped_file.write(zfile.read(dict_name))

def download_artifact(archive_dest):
    target_files = ['jmdict-eng-$tag.json.zip']
    repo = 'https://github.com/scriptin/jmdict-simplified/releases'
    with urllib.request.urlopen(f'{repo}/latest/') as response:
        m = re.match('.*\/releases\/tag\/(?P<tag>.*)$', response.url)
        release_tag = m.group('tag')
        for file in target_files:
            target_url = f'{repo}/download/{release_tag}/{Template(file).substitute(tag=release_tag)}'
            with urllib.request.urlopen(target_url) as zipresp:
                zipb = BytesIO(zipresp.read())
                os.makedirs(os.path.dirname(archive_dest), exist_ok=True)
                with open(archive_dest, "wb") as f:
                    f.write(zipb.getbuffer())

archive_dest = 'third-party/jmdict-simplified/jmdict-eng.zip'
extracted_dest = 'public/jmdict-simplified/jmdict-eng.json'

archive_path = Path(archive_dest)
if archive_path.is_file():
    lazy_unzip(archive_path, extracted_dest)
else:
    download_artifact(archive_path)
    lazy_unzip(archive_path, extracted_dest)
    