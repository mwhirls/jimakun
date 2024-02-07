import React, { useContext } from 'react';
import { Cog8ToothIcon } from '@heroicons/react/24/outline'
import { ChromeExtensionContext, ExtensionContext } from '../../content-scripts/contexts/ExtensionContext';
import { sendMessage } from '../../content-scripts/util/browser-runtime';
import { RuntimeMessage, RuntimeEvent } from '../events';

function openOptions(context: ExtensionContext) {
    const message: RuntimeMessage = { event: RuntimeEvent.enum.OpenOptions, data: undefined };
    return sendMessage(message, context);
}

export interface OptionsButtonProps {
    className?: string;
}

function OptionsButton({ className }: OptionsButtonProps) {
    const context = useContext(ChromeExtensionContext);
    return (
        <button className={`${className}`} onClick={() => openOptions(context)}>
            <Cog8ToothIcon className='text-slate-400 hover:text-black'></Cog8ToothIcon>
        </button>
    )
}

export default OptionsButton;