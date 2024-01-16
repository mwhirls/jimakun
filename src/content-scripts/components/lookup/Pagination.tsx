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

function itemContent(content: Icon | string) {
    const inner = () => {
        if (content instanceof Icon) {
            return (
                <img src={content.url}></img>
            )
        } else if (typeof content === 'string') {
            return (
                <div className="m-3 text-3xl font-normal">{content}</div>
            )
        } else {
            throw new Error('unrecognized content type');
        }
    }
    return (
        <div className="flex flex-column justify-around">
            {inner()}
        </div>
    )
}

class PageItem {
    content: Icon | string;

    constructor(content: Icon | string) {
        this.content = content;
    }

    render(): JSX.Element {
        return itemContent(this.content);
    }
}

class PageNavigation extends PageItem {
    onClick: () => void;
    selected: Selected;
    mirrored: Mirrored;

    constructor(content: Icon | string, onClick: () => void, selected: Selected, mirrored: Mirrored) {
        super(content);
        this.onClick = onClick;
        this.selected = selected;
        this.mirrored = mirrored;
    }

    render(): JSX.Element {
        const color = this.selected === Selected.Yes ? "bg-red-500" : "bg-white";
        const textColor = this.selected === Selected.Yes ? "text-white" : "text-black";
        const mirror = this.mirrored === Mirrored.Yes ? "-scale-x-100" : "scale-x-100";
        return (
            <button onClick={() => this.onClick()} className={`border border-solid rounded-lg border-slate-300 w-full h-full ${color} ${textColor} ${mirror}`}>
                {itemContent(this.content)}
            </button>
        )
    }
}

function numberedPage(page: number, selectedPage: number, onPageClicked: (page: number) => void) {
    const selected = page === selectedPage ? Selected.Yes : Selected.No;
    const onClickNumbered = () => onPageClicked(page);
    return new PageNavigation(page.toString(), onClickNumbered, selected, Mirrored.No);
}

export interface PaginationProps {
    numPages: number;
    onPageClicked: (page: number) => void;
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
    const firstFewPages = pages.slice(0, Math.min(3, pages.length - 2)).map(page => numberedPage(page, selectedPage, onClick));
    const collapsedPages = pages.length >= 5 ? new PageItem("...") : undefined;
    const finalPages = pages.slice(pages.length - 1).map(page => numberedPage(page, selectedPage, onClick));
    const items = [
        new PageNavigation(firstIcon, onClickFirst, Selected.No, Mirrored.No),
        new PageNavigation(prevIcon, onClickPrev, Selected.No, Mirrored.No),
        ...firstFewPages,
        collapsedPages,
        ...finalPages,
        new PageNavigation(prevIcon, onClickNext, Selected.No, Mirrored.Yes),
        new PageNavigation(firstIcon, onClickLast, Selected.No, Mirrored.Yes),
    ];

    return (
        <div className="flex flex-row gap-4">
            {
                items.map((item, index) => {
                    if (!item) {
                        return <></>;
                    }
                    return (
                        <div key={index} className="flex-1">
                            {item.render()}
                        </div>
                    );
                })
            }
        </div>
    );
}
export default Pagination;