import React, { Fragment, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Alert, { AlertButtons } from './Alert';

// https://tailwindui.com/components/application-ui/overlays/dialogs

interface ModalProps {
    open: boolean;
    headerText: string;
    bodyText: string;
    buttons: AlertButtons;
    scale?: number;
    onClickOutside?: () => void;
}

export default function Modal({ open, headerText, bodyText, buttons, scale, onClickOutside }: ModalProps) {
    const initialFocusRef = useRef(null)

    const onClose = () => {
        if (onClickOutside) {
            onClickOutside();
        }
    }

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={initialFocusRef} onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Alert ref={initialFocusRef} headerText={headerText} bodyText={bodyText} buttons={buttons} scale={scale}></Alert>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
