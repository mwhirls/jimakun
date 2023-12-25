import React from 'react';
import * as bunsetsu from "bunsetsu";

export interface NotesProps {
    word: bunsetsu.Word;
}

function Notes({ word }: NotesProps) {
    return (
        <div>
            <p>This is a custom user note</p>
        </div>
    );
}
export default Notes;