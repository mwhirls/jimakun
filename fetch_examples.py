#!/usr/bin/env python3

from pathlib import Path
from unzip import lazy_unzip

class Archive:
    def __init__(self, archive_path, extracted_dest):
        self.archive_path = archive_path
        self.extracted_dest = extracted_dest


archives = [
    Archive('third-party/tatoeba/jpn_eng_pairs.zip', 
            'public/tatoeba/jpn_eng_pairs.tsv'),
    Archive('third-party/tatoeba/jpn_indices.tar.bz2', 
            'public/tatoeba/jpn_indices.csv'),
]

for archive in archives:
    archive_path = Path(archive.archive_path)
    if archive_path.is_file():
        lazy_unzip(archive_path, archive.extracted_dest)
    