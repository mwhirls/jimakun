import React, { useContext } from 'react';
import { Cog8ToothIcon } from '@heroicons/react/24/outline'
import { RuntimeMessage, RuntimeEvent } from '../../../common/events';
import { sendMessage } from '../../util/browser-runtime';
import { ChromeExtensionContext, ExtensionContext } from '../../contexts/ExtensionContext';

function openOptions(context: ExtensionContext) {
    const message: RuntimeMessage = { event: RuntimeEvent.OpenOptions, data: undefined };
    return sendMessage(message, context);
}

function Footer() {
    const context = useContext(ChromeExtensionContext);

    return (
        <div className='flex-none'>
            <hr></hr>
            <button className='mt-3 w-12 float-right' onClick={() => openOptions(context)}>
                <Cog8ToothIcon className='text-slate-400 hover:text-black'></Cog8ToothIcon>
            </button>
        </div>
    );
}
export default Footer;