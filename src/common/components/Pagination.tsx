import React, { useState } from "react";
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

const NUM_LEADING_PAGES = 1;
const NUM_FOLLOWING_PAGES = 1;

enum Selected {
    Yes,
    No,
}

enum Mirrored {
    Yes,
    No,
}

class Icon {
    content: JSX.Element;

    constructor(content: JSX.Element) {
        this.content = content;
    }

    render() {
        return (
            <div className="block m-auto w-8">
                {this.content}
            </div>
        )
    }
}

class Text {
    content: string;

    constructor(content: string) {
        this.content = content;
    }

    render() {
        return (
            <div className="text-2xl text-center mx-3">{this.content}</div>
        )
    }
}

class PageItem {
    content: Icon | Text;

    constructor(content: Icon | Text) {
        this.content = content;
    }

    render(): JSX.Element {
        return this.content.render();
    }
}


class PageNavigation extends PageItem {
    onClick: () => void;
    selected: Selected;
    mirrored: Mirrored;
    disabled: boolean;

    constructor(content: Icon | Text, onClick: () => void, selected: Selected, mirrored: Mirrored, disabled: boolean) {
        super(content);
        this.onClick = onClick;
        this.selected = selected;
        this.mirrored = mirrored;
        this.disabled = disabled;
    }

    render(): JSX.Element {
        const mirror = this.mirrored === Mirrored.Yes ? "-scale-x-100" : "scale-x-100";
        const selected = this.selected === Selected.Yes ? "text-black font-semibold border-b-2 border-solid border-red-600" : "text-slate-400 font-normal hover:text-black hover:font-semibold";
        return (
            <button onClick={() => this.onClick()} className={`w-full h-full p-2 align-top bg-white ${mirror} ${selected} disabled:text-slate-300 disabled:font-normal disabled:cursor-not-allowed disabled:pointer-events-none`} disabled={this.disabled}>
                {this.content.render()}
            </button>
        )
    }
}

function numberedPage(page: number, selectedPage: number, onPageClicked: (page: number) => void) {
    const selected = page === selectedPage ? Selected.Yes : Selected.No;
    const onClickNumbered = () => onPageClicked(page);
    const number = new Text((page + 1).toString());
    return new PageNavigation(number, onClickNumbered, selected, Mirrored.No, false);
}

function leadingPages(pages: number[]) {
    const end = Math.min(NUM_LEADING_PAGES, pages.length - 1);
    return pages.slice(0, end);
}

function currentPages(pages: number[], selected: number) {
    const start = Math.max(selected - 1, 0)
    const end = Math.min(selected + 2, pages.length)
    return pages.slice(start, end);
}

function followingPages(pages: number[]) {
    const start = Math.max(0, pages.length - NUM_FOLLOWING_PAGES);
    return pages.slice(start, pages.length);
}

export interface PaginationProps {
    numPages: number;
    onPageClicked: (page: number) => void;
}

function Pagination({ numPages, onPageClicked }: PaginationProps) {
    const [selectedPage, setSelectedPage] = useState<number>(0);

    const prevIcon = new Icon(<ChevronLeftIcon></ChevronLeftIcon>);

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
    const current = currentPages(pages, selectedPage);
    const leading = leadingPages(pages).filter((value) => value < current[0] - 1);
    const following = followingPages(pages).filter((value) => value > current[current.length - 1] + 1);
    const items = [
        new PageNavigation(prevIcon, onClickPrev, Selected.No, Mirrored.No, selectedPage <= 0),
        ...(leading.map(page => numberedPage(page, selectedPage, onClick))),
        leading.length ? new PageItem(new Text("...")) : [],
        ...(current.map(page => numberedPage(page, selectedPage, onClick))),
        following.length ? new PageItem(new Text("...")) : [],
        ...(following.map(page => numberedPage(page, selectedPage, onClick))),
        new PageNavigation(prevIcon, onClickNext, Selected.No, Mirrored.Yes, selectedPage >= pages.length - 1),
    ].flat();

    return (
        <div className="flex flex-row gap-2 m-3">
            {
                items.map((item, index) => {
                    return (
                        <div key={index} className="flex flex-col justify-center items-center">
                            {item.render()}
                        </div>
                    );
                })
            }
        </div>
    );
}
export default Pagination;