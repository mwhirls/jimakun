import React from "react";
interface ToggleProps {
    toggled: boolean;
    onToggle: (toggled: boolean) => void;
    className?: string;
}

function Toggle({ className, toggled, onToggle }: ToggleProps) {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.currentTarget.checked;
        onToggle(checked);
    };

    return (
        <div className={className}>
            <label className="relative inline-flex cursor-pointer items-center p-1">
                <input type="checkbox" className="peer sr-only" checked={toggled} onChange={onChange} />
                <span className="h-6 w-11 rounded-full bg-gray-300 leading-5 shadow-inner peer-checked:bg-blue-600 peer-focus:ring-4">
                </span>
                <span className="absolute h-5 w-5 rounded-full ml-[0.1rem] inline-block bg-white align-middle leading-8 drop-shadow-sm peer-checked:translate-x-full transition ease-in-out"></span>
            </label>
        </div>
    );
}
export default Toggle;