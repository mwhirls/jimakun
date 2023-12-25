import React from 'react';
import * as bunsetsu from "bunsetsu";
import Footer from './Footer';
import Definitions from './Definitions';
import Header from './Header';

export interface CardProps {
    word: bunsetsu.Word;
}

function Card({ word }: CardProps) {
    return (
        <div className="bg-white rounded-md text-black">
            <Header word={word}></Header>
            <Definitions word={word}></Definitions>
            <Footer></Footer>
        </div>
    );
}
export default Card;