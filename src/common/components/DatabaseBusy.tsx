import React from 'react';
import ProgressBar from "../../content-scripts/components/lookup/ProgressBar";
import { DBOperation } from "../../database/database";
import { Busy, DataSource } from '../../database/dbstatus';

interface DatabaseBusyProps {
    dbStatus: Busy;
}

function DatabaseBusy({ dbStatus }: DatabaseBusyProps) {
    const text = () => {
        const sourceText = () => {
            switch (dbStatus.source) {
                case DataSource.JMDict:
                    return "dictionary"
                case DataSource.KanjiDic2:
                    return "kanji data";
                case DataSource.Tatoeba:
                    return "example sentences";
            }
        }
        switch (dbStatus.operation) {
            case DBOperation.Open:
                return `Establishing connection...`;
            case DBOperation.Upgrade:
                return "Upgrading database...";
            case DBOperation.FetchData:
                return `Fetch latest ${sourceText()}...`;
            case DBOperation.ParseData:
                return `Parsing latest ${sourceText()}...`;
            case DBOperation.PutData:
                return `Adding ${sourceText()} to database...`;
            default:
                return 'Loading...';
        }
    }
    return (
        <div className='flex flex-col justify-center items-center m-auto gap-8 w-[40rem] max-w-full h-[30rem] max-h-full py-6'>
            <div>
                <div className='text-4xl font-bold mb-6 text-center'>{text()}</div>
                <div className='w-4/5 mx-auto'>
                    <ProgressBar progress={dbStatus.progress} units={'entries'} ></ProgressBar>
                </div>
            </div>
            <div className='text-2xl font-light text-center text-slate-500 w-11/12'>Please wait for the dictionaries to initialize... This may take a few minutes after installing or updating Jimakun.</div>
        </div>
    )
}

export default DatabaseBusy;