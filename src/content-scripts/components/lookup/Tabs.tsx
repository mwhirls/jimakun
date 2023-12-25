import React from 'react';

export interface Tab {
    label: string,
    content: React.JSX.Element;
}

export interface TabProps {
    tabs: Tab[];
    selectedIndex: number;
}

function Tabs({ tabs, selectedIndex }: TabProps) {
    const content = selectedIndex >= 0 && selectedIndex < tabs.length ? tabs[selectedIndex].content : <></>;
    return (
        <>
            <div className='flex flex-row'>
                {
                    tabs.map((tab: Tab, index: number) => {
                        return (
                            <h4 key={index}>
                                {tab.label}
                            </h4>
                        )
                    })
                }
            </div>
            <div className='overflow-y-auto'>
                {content}
            </div>
        </>
    );
}
export default Tabs;