import React from 'react';

interface ConfirmCancelProps {
    buttonText: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmCancel = React.forwardRef((props: ConfirmCancelProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
    return (
        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                onClick={() => props.onConfirm()}
            >
                {props.buttonText}
            </button>
            <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={() => props.onCancel()}
                ref={ref}
            >
                Cancel
            </button>
        </div>
    );
});
ConfirmCancel.displayName = 'ConfirmCancel';

export default ConfirmCancel;
