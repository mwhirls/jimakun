import React, { useState } from 'react';
import * as bunsetsu from "bunsetsu";
import { getIntermediateForms } from '../../../../common/lang';
import ConjugationVisualizer from './ConjugationVisualizer';
import InfoText from './InfoText';
import InteractiveConjugation from './InteractiveConjugation';

export interface ConjugationProps {
    word: bunsetsu.Word;
}

function Conjugation({ word }: ConjugationProps) {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const forms = getIntermediateForms(word);
    return (
        <>
            <InteractiveConjugation forms={forms} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}></InteractiveConjugation>
            <ConjugationVisualizer forms={forms} selectedIndex={selectedIndex} setSelectedIndex={(index) => setSelectedIndex(index)}></ConjugationVisualizer>
            <InfoText forms={forms} selectedIndex={selectedIndex}></InfoText>
        </>
    );
}
export default Conjugation;
