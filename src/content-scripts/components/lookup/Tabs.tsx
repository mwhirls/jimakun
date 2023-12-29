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
        <div className='flex flex-col overflow-y-hidden'>
            <div className='flex flex-row bg-slate-100 rounded-md'>
                {
                    tabs.map((tab: Tab, index: number) => {
                        const label = (
                            <h4 className='font-normal text-3xl text-black'>
                                {tab.label}
                            </h4>
                        );
                        if (index === selectedIndex) {
                            return (
                                <div key={index} className="m-3 p-3 bg-white rounded-md">
                                    {label}
                                </div>
                            )
                        }
                        return (
                            <div key={index} className="m-3 p-3">
                                {label}
                            </div>
                        )
                    })
                }
            </div>
            <div className='my-6 pr-6 overflow-y-auto'>
                {content}
            </div>
        </div>
    );
}
export default Tabs;