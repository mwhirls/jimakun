import React, { useState } from 'react';
import * as bunsetsu from "bunsetsu";
import Footer from './Footer';
import Definitions from './Definitions';
import Header from './Header';
import Tabs from './Tabs';
import Examples from './Examples';
import Kanji from './Kanji';
import Notes from './Notes';

export interface CardProps {
    word: bunsetsu.Word;
}

function Card({ word }: CardProps) {
    const [selectedTab, setSelectedTab] = useState(0);
    const tabs = [
        {
            label: "Definitions",
            content: <Definitions word={word}></Definitions>
        },
        {
            label: "Kanji",
            content: <Kanji word={word}></Kanji>
        },
        {
            label: "Examples",
            content: <Examples word={word}></Examples>
        },
        {
            label: "Notes",
            content: <Notes word={word}></Notes>
        }
    ];

    return (
        <div className="bg-white rounded-md text-black p-10">
            <Header word={word}></Header>
            <Tabs tabs={tabs} selectedIndex={selectedTab}></Tabs>
            <Footer></Footer>
        </div>
    );
}
export default Card;