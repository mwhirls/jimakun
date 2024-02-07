import React from 'react'
import { Dialog } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import ConfirmCancel from './ConfirmCancel';
import ReloadButton from './ReloadButton';

// https://tailwindui.com/components/application-ui/overlays/dialogs

export interface ConfirmCancelButtons {
    type: "ConfirmCancel";
    buttonText: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export interface ReloadButton {
    type: "Reload";
}

export type AlertButtons = ConfirmCancelButtons | ReloadButton;

export interface AlertProps {
    headerText: string;
    bodyText: string;
    scale?: number;
    buttons: AlertButtons;
}

const Alert = React.forwardRef((props: AlertProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const scaleXY = props.scale ?? 1.0;
    const panelStyle = {
        transform: `scale(${scaleXY})`,
    };

    const buttons = () => {
        switch (props.buttons.type) {
            case "ConfirmCancel":
                return <ConfirmCancel ref={ref} buttonText={props.buttons.buttonText} onConfirm={props.buttons.onConfirm} onCancel={props.buttons.onCancel}></ConfirmCancel>
            case "Reload":
                return (
                    <div className='w-full pb-4'><ReloadButton ref={ref} className='block w-48 mx-auto'></ReloadButton></div>
                )
        }
    }

    return (
        <Dialog.Panel style={panelStyle} className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                            {props.headerText}
                        </Dialog.Title>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                {props.bodyText}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {buttons()}
        </Dialog.Panel>
    );
});
Alert.displayName = "Alert";
export default Alert;
