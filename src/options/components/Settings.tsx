import React, { useState } from "react";
import AppLogo from "../../common/components/AppLogo";
import PurgeButton from "./PurgeButton";
import EnabledToggle from "../../popup/components/EnabledToggle";

interface Setting {
    name: string;
    infoText: string;
    component: JSX.Element;
}

interface SettingsListProps {
    settings: Setting[];
}

function SettingsList({ settings }: SettingsListProps) {
    return (
        <div className="grid grid-cols-2 gap-8 mt-8 items-center">
            {
                settings.map((setting, index) => {
                    const row = (
                        <React.Fragment key={index}>
                            {index > 0 && <div className="border-t border-slate-100 border-solid col-span-2"></div>}
                            <div>
                                <h3 className="text-3xl font-bold">{setting.name}</h3>
                                <p className="text-2xl text-slate-500 mt-2">{setting.infoText}</p>
                            </div>
                            <div className="justify-self-end">
                                {setting.component}
                            </div>
                        </React.Fragment>
                    );

                    return row;
                })
            }
        </div>
    );
}

function Settings() {
    const [enabled, setEnabled] = useState(false);

    const settings = [
        {
            name: "Enabled",
            infoText: `Enable/disable Jimakun. Disable Jimakun to re-enable the normal Japanese subtitles on Netflix.`,
            component: <EnabledToggle enabled={enabled} onSetEnabled={(enabled) => setEnabled(enabled)} className="scale-[1.75]"></EnabledToggle>
        },
        {
            name: "Purge Dictionaries",
            infoText: `Forcefully purge all dictionary databases and attempt to reimport dictionaries. This can be used to reset the state of the backend in the event that Jimakun encounters an error during upgrade.`,
            component: <PurgeButton></PurgeButton>
        }
    ];
    return (
        <>
            <div className="border-b border-solid border-slate-100 bg-white p-4 drop-shadow">
                <AppLogo className="w-4/5 max-w-[175rem] my-4 mx-auto text-3xl h-16"></AppLogo>
            </div>
            <div className="w-4/5 max-w-[175rem] mx-auto my-8 flex flex-col gap-4 bg-white drop-shadow rounded-lg p-8 border-slate-100 border border-solid">
                <h1 className="text-4xl font-bold my-4">Settings</h1>
                <hr></hr>
                <SettingsList settings={settings}></SettingsList>
            </div >
        </>
    )
}

export default Settings;