import {
    ActionIcon,
    Divider,
    Menu,
    SegmentedControl,
    Select,
    Text,
} from "@mantine/core";
import * as React from "react";
import languages from "../content/languages.json";
import { type DictionaryMode, useResponse } from "@/hooks";

const Monolingual = () => {
    const setSettings = useResponse((s) => s.setPreferences);
    const { inputLanguage } = useResponse((s) => s.preferences);
    return (
        <div className="">
            <Select
                label="Your language"
                placeholder="Pick one"
                defaultValue={inputLanguage}
                data={languages}
                value={inputLanguage}
                onChange={(lang) => setSettings({ inputLanguage: lang || "en" })}
            />
        </div>
    );
};
const Bilingual = () => {
    const setSettings = useResponse((s) => s.setPreferences);
    const inputLanguage = useResponse((s) => s.preferences.inputLanguage);
    const outputLanguage = useResponse((s) => s.preferences.outputLanguage);
    return (
        <div>
            <div className="gap-2 flex-row-start">
                <Select
                    label="Transalte from "
                    placeholder="Pick a language"
                    defaultValue={"en"}
                    data={languages}
                    value={inputLanguage}
                    onChange={(lang) => setSettings({ inputLanguage: lang || "en" })}
                />
                <Select
                    label="To"
                    placeholder="Pick a language"
                    defaultValue={"de"}
                    data={languages}
                    value={outputLanguage || "de"}
                    onChange={(lang) => setSettings({ outputLanguage: lang || "de" })}
                />
            </div>
        </div>
    );
};
function uppercaseFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

//======================================
const SettingsDropdown = () => {
    const { inputLanguage, outputLanguage, mode } = useResponse(
        (s) => s.preferences
    );
    const setSettings = useResponse((s) => s.setPreferences);
    const onChange = (mode: DictionaryMode) => {
        setSettings({ mode });
    };
    return (
        <Menu shadow="lg" width={350} position="bottom-start">
            <Menu.Target>
                <ActionIcon size="xl" fw="bold" className="h-full w-full rounded-l-xl">
                    <Text size="xs">
                        {uppercaseFirstLetter(inputLanguage)}
                        {mode === "bili" &&
                            "-" + uppercaseFirstLetter(outputLanguage as string)}
                    </Text>
                </ActionIcon>
            </Menu.Target>
            <Divider orientation="vertical" mr={4} />
            <Menu.Dropdown p="sm">
                <SegmentedControl
                    value={mode}
                    onChange={onChange}
                    fullWidth
                    data={[
                        { label: "Monolingual", value: "mono" },
                        { label: "Bilingual", value: "bili" },
                    ]}
                    className="mb-3"
                />
                {mode === "mono" ? <Monolingual /> : <Bilingual />}
            </Menu.Dropdown>
        </Menu>
    );
};
export default SettingsDropdown;
