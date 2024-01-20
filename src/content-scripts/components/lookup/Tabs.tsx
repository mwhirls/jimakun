import React from 'react';

export interface Tab {
    label: string,
    content: React.JSX.Element;
}

export interface TabProps {
    tabs: Tab[];
    selectedIndex: number;
    onSelected: (index: number) => void;
}

function Tabs({ tabs, selectedIndex, onSelected }: TabProps) {
    const content = selectedIndex >= 0 && selectedIndex < tabs.length ? tabs[selectedIndex].content : <></>;
    return (
        <div className='flex flex-col'>
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
                                <button key={index} className="m-3 p-3 bg-white rounded-md" onClick={() => onSelected(index)}>
                                    {label}
                                </button>
                            )
                        }
                        return (
                            <button key={index} className="m-3 p-3" onClick={() => onSelected(index)}>
                                {label}
                            </button>
                        )
                    })
                }
            </div>
            <div className='my-6 pr-6 overflow-y-auto min-h-[20rem] h-[22rem] min-w-full w-[45rem] max-w-full'>
                {content}
            </div>
        </div>
    );
}
export default Tabs;