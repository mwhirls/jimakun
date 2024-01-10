#!/usr/bin/env python3

from zipfile import ZipFile
import bz2
import tarfile
from pathlib import Path
import os

def extract_zip(zip_path, dest):
    with ZipFile(zip_path.absolute()) as zfile:
        names = zfile.namelist()
        assert len(names) == 1, "expected single zipped file"
        filename = names[0]
        archive = Path(f'{dest}/{filename}')
        if not archive.is_file():
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "wb") as unzipped_file:
                unzipped_file.write(zfile.read(filename))

def extract_tar(archive_path, dest, format=""):
    with tarfile.open(archive_path, f'r:{format}') as tar:
        names = tar.getnames()
        assert len(names) == 1, "expected single archived file"
        filename = names[0]
        archive = Path(f'{dest}/{filename}')
        if not archive.is_file():
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            mfile = tar.extractfile(filename)
            with open(dest, "wb") as unzipped_file:
                unzipped_file.write(mfile.read())

def lazy_unzip(archive_path, dest):
    ext = Path(archive_path).suffix
    if ext == '.tar':
        extract_tar(archive_path, dest)
    elif ext == '.bz2':
        extract_tar(archive_path, dest, "bz2")
    elif ext == '.zip':
        extract_zip(archive_path, dest)