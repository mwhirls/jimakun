import React from 'react';

export interface Tab {
    label: string,
    content: React.JSX.Element;
    disabled: boolean;
}

export interface TabProps {
    tabs: Tab[];
    selectedIndex: number;
    onSelected: (index: number) => void;
}

function Tabs({ tabs, selectedIndex, onSelected }: TabProps) {
    const content = selectedIndex >= 0 && selectedIndex < tabs.length ? tabs[selectedIndex].content : <></>;
    return (
        <div className='flex flex-col max-h-full'>
            <div className='flex flex-row bg-white rounded-md'>
                {
                    tabs.map((tab: Tab, index: number) => {
                        const selected = index === selectedIndex ? "text-black border-b-2 border-solid border-b-red-600" : "text-slate-400 hover:text-black";
                        return (
                            <button key={index} className={`p-4 disabled:text-slate-300 disabled:cursor-not-allowed ${selected}`} disabled={tab.disabled} onClick={() => onSelected(index)}>
                                <h4 className='text-3xl text-medium'>
                                    {tab.label}
                                </h4>
                            </button>
                        )
                    })
                }
            </div>
            <div className='my-6 pr-6 overflow-y-auto min-h-[5rem] h-[22rem] min-w-full w-[45rem] max-w-full scrollbar'>
                {content}
            </div>
        </div>
    );
}
export default Tabs;