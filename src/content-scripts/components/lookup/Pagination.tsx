import React, { useState } from "react";
import ChevronLeftIcon from '../../../../public/assets/chevron-left.svg';

class SVG {
    jsx: JSX.Element;

    constructor(jsx: JSX.Element) {
        this.jsx = jsx;
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

function itemContent(content: SVG | string) {
    const inner = () => {
        if (content instanceof SVG) {
            return (
                <div className="block m-auto">
                    {content.jsx}
                </div>
            )
        } else if (typeof content === 'string') {
            return (
                <div className="text-2xl font-normal text-center mx-3">{content}</div>
            )
        } else {
            throw new Error('unrecognized content type');
        }
    }
    return (
        <div>
            {inner()}
        </div>
    )
}

class PageItem {
    content: SVG | string;

    constructor(content: SVG | string) {
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

    constructor(content: SVG | string, onClick: () => void, selected: Selected, mirrored: Mirrored) {
        super(content);
        this.onClick = onClick;
        this.selected = selected;
        this.mirrored = mirrored;
    }

    render(): JSX.Element {
        const mirror = this.mirrored === Mirrored.Yes ? "-scale-x-100" : "scale-x-100";
        const border = this.selected === Selected.Yes ? "border border-solid border-black" : "";
        return (
            <button onClick={() => this.onClick()} className={`w-full h-full align-top ${border} rounded-lg bg-white hover:bg-red-500 active:bg-red-400 text-black hover:text-white ${mirror}`}>
                {itemContent(this.content)}
            </button>
        )
    }
}

function numberedPage(page: number, selectedPage: number, onPageClicked: (page: number) => void) {
    const selected = page === selectedPage ? Selected.Yes : Selected.No;
    const onClickNumbered = () => onPageClicked(page);
    return new PageNavigation((page + 1).toString(), onClickNumbered, selected, Mirrored.No);
}

export interface PaginationProps {
    numPages: number;
    onPageClicked: (page: number) => void;
}

function Pagination({ numPages, onPageClicked }: PaginationProps) {
    const [selectedPage, setSelectedPage] = useState<number>(0);

    const prevIcon = new SVG(<ChevronLeftIcon></ChevronLeftIcon>);

    const onClick = (page: number) => {
        setSelectedPage(page);
        onPageClicked(page);
    }
    const onClickPrev = () => onClick(selectedPage - 1);
    const onClickNext = () => onClick(selectedPage + 1);

    if (numPages <= 1) {
        return <></>;
    }

    const pages = Array.from(Array(numPages).keys());
    const firstFewPages = pages.slice(0, Math.min(2, pages.length - 2)).map(page => numberedPage(page, selectedPage, onClick));
    const collapsedPages = pages.length >= 5 ? new PageItem("...") : undefined;
    const finalPages = pages.slice(pages.length - 1).map(page => numberedPage(page, selectedPage, onClick));
    const items = [
        new PageNavigation(prevIcon, onClickPrev, Selected.No, Mirrored.No),
        ...firstFewPages,
        collapsedPages,
        ...finalPages,
        new PageNavigation(prevIcon, onClickNext, Selected.No, Mirrored.Yes),
    ];

    return (
        <div className="inline-grid gap-2 auto-cols-fr grid-flow-col m-3">
            {
                items.map((item, index) => {
                    if (!item) {
                        return <></>;
                    }
                    return (
                        <div key={index} className="flex flex-col justify-center items-center aspect-square">
                            {item.render()}
                        </div>
                    );
                })
            }
        </div>
    );
}
export default Pagination;