import React, { useState } from "react";

const FIRST_ICON = 'assets/first.svg';
const PREV_ICON = 'assets/prev.svg';

class Icon {
    url: string

    constructor(url: string) {
        this.url = chrome.runtime.getURL(url);
    }
}

enum Selected {
    Yes,
    No,
}

enum Mirrored {
    Yes,
    No,
}

export interface PaginationProps {
    numPages: number;
    onPageClicked: (page: number) => void;
}

function buttonContent(content: Icon | string) {
    if (content instanceof Icon) {
        return (
            <img src={content.url}></img>
        )
    } else if (typeof content === 'string') {
        return (
            <div>{content}</div>
        )
    } else {
        throw new Error('unrecognized content type');
    }
}

function pageButton(content: Icon | string, selected: Selected, mirrored: Mirrored, onClick: () => void) {
    const contentElem = buttonContent(content);
    const color = selected === Selected.Yes ? "bg-red-500" : "bg-white";
    const textColor = selected === Selected.Yes ? "text-white" : "text-black";
    const mirror = mirrored === Mirrored.Yes ? "-scale-x-100" : "scale-x-100";
    return (
        <button onClick={() => onClick()} className={`border border-solid rounded-lg border-slate-300 ${color} ${textColor} ${mirror}`}>
            {contentElem}
        </button>
    )
}

function Pagination({ numPages, onPageClicked }: PaginationProps) {
    const [selectedPage, setSelectedPage] = useState<number>(0);
    const firstIcon = new Icon(FIRST_ICON);
    const prevIcon = new Icon(PREV_ICON);

    const onClick = (page: number) => {
        setSelectedPage(page);
        onPageClicked(page);
    }

    const onClickFirst = () => onClick(0);
    const onClickPrev = () => onClick(selectedPage - 1);
    const onClickNext = () => onClick(selectedPage + 1);
    const onClickLast = () => onClick(numPages - 1);

    const pages = Array.from(Array(numPages).keys());
    const firstFewPages = pages.slice(0, Math.min(3, pages.length - 2));
    const finalPages = pages.slice(pages.length - 1);

    const numberedPage = (page: number) => {
        const selected = page === selectedPage ? Selected.Yes : Selected.No;
        const onClickNumbered = () => onPageClicked(page);
        return (
            <div key={page}>
                {pageButton(page.toString(), selected, Mirrored.No, onClickNumbered)}
            </div>
        );
    }

    return (
        <div className="flex flex-auto flex-row flex-nowrap basis-16 gap-4">
            {pageButton(firstIcon, Selected.No, Mirrored.No, onClickFirst)}
            {pageButton(prevIcon, Selected.No, Mirrored.No, onClickPrev)}
            {firstFewPages.map((page) => numberedPage(page))}
            {pages.length < 5 || <div>...</div>}
            {finalPages.map((page) => numberedPage(page))}
            {pageButton(prevIcon, Selected.No, Mirrored.Yes, onClickNext)}
            {pageButton(firstIcon, Selected.No, Mirrored.Yes, onClickLast)}
        </div>
    );
}
export default Pagination;