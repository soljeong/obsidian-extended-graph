import { Modifier, Platform, Setting } from "obsidian";
import { ExtendedGraphSettingTab, ExtendedGraphInstances, NodeTapAction, SettingsSection, t } from "../internal";

export class SettingInput extends SettingsSection {

    constructor(settingTab: ExtendedGraphSettingTab) {
        super(settingTab, 'inputs', t("features.ids.inputs"), t("inputs.inputs"), 'mouse', "");
    }

    protected override addBody() {
        this.addNodeTapAction();
        this.addRadialMenu();
        this.addPinHotkey();
        this.addSelectHotkey();

        this.checkCompatibility();
    }

    private addNodeTapAction() {
        const setting = new Setting(this.settingTab.containerEl)
            .setName(t("inputs.nodeTapAction"))
            .setDesc(t("inputs.nodeTapActionDesc"))
            .addDropdown(cb => {
                cb.addOptions({
                    'open-note': t("inputs.nodeTapActionOpenNote"),
                    'open-radial-menu': t("inputs.nodeTapActionOpenRadialMenu"),
                });
                cb.setValue(ExtendedGraphInstances.settings.nodeTapAction);
                cb.onChange(async (value) => {
                    ExtendedGraphInstances.settings.nodeTapAction = value as NodeTapAction;
                    await ExtendedGraphInstances.plugin.saveSettings();
                });
            });

        this.elementsBody.push(setting.settingEl);
    }

    private addRadialMenu() {
        const setting = new Setting(this.settingTab.containerEl)
            .setName(t("inputs.radialMenu"))
            .setDesc(t("inputs.radialMenuDesc"))
            .addDropdown(cb => {
                cb.addOptions({
                    '': '',
                    'Mod': Platform.isMacOS ? 'Cmd (Mod)' : 'Ctrl (Mod)',
                    'Ctrl': 'Ctrl',
                    'Meta': Platform.isMacOS ? 'Cmd (Meta)' : 'Win',
                    'Shift': 'Shift',
                    'Alt': 'Alt'
                });
                cb.setValue(ExtendedGraphInstances.settings.useRadialMenu ? ExtendedGraphInstances.settings.radialMenuModifier : '');
                cb.onChange(async (value) => {
                    if (value === '') {
                        ExtendedGraphInstances.settings.useRadialMenu = false;
                    }
                    else {
                        ExtendedGraphInstances.settings.useRadialMenu = true;
                        ExtendedGraphInstances.settings.radialMenuModifier = value as Modifier;
                    }
                    await ExtendedGraphInstances.plugin.saveSettings();
                    this.checkCompatibility();
                })
            });

        this.elementsBody.push(setting.settingEl);
    }

    private addPinHotkey() {
        const setting = new Setting(this.settingTab.containerEl)
            .setName(t("inputs.pinHotkey"))
            .setDesc(t("inputs.pinHotkeyDesc"))
            .addDropdown(cb => {
                cb.addOptions({
                    '': '',
                    'Mod': Platform.isMacOS ? 'Cmd (Mod)' : 'Ctrl (Mod)',
                    'Ctrl': 'Ctrl',
                    'Meta': Platform.isMacOS ? 'Cmd (Meta)' : 'Win',
                    'Shift': 'Shift',
                    'Alt': 'Alt'
                });
                cb.setValue(ExtendedGraphInstances.settings.pinNodeModifier ? ExtendedGraphInstances.settings.pinNodeModifier : '');
                cb.onChange(async (value) => {
                    if (value === '') {
                        ExtendedGraphInstances.settings.pinNodeModifier = undefined;
                    }
                    else {
                        ExtendedGraphInstances.settings.pinNodeModifier = value as Modifier;
                    }
                    await ExtendedGraphInstances.plugin.saveSettings();
                    this.checkCompatibility();
                })
            });

        this.elementsBody.push(setting.settingEl);
    }

    private addSelectHotkey() {
        const setting = new Setting(this.settingTab.containerEl)
            .setName(t("inputs.selectHotkey"))
            .setDesc(t("inputs.selectHotkeyDesc"))
            .addDropdown(cb => {
                cb.addOptions({
                    'Mod': Platform.isMacOS ? 'Cmd (Mod)' : 'Ctrl (Mod)',
                    'Ctrl': 'Ctrl',
                    'Meta': Platform.isMacOS ? 'Cmd (Meta)' : 'Win',
                    'Shift': 'Shift',
                    'Alt': 'Alt'
                });
                cb.setValue(ExtendedGraphInstances.settings.selectNodeModifier);
                cb.onChange(async (value) => {
                    ExtendedGraphInstances.settings.selectNodeModifier = value as Modifier;
                    await ExtendedGraphInstances.plugin.saveSettings();
                    this.checkCompatibility();
                })
            });

        this.elementsBody.push(setting.settingEl);
    }

    private checkCompatibility() {
        const rightClickModifiers = [
            ExtendedGraphInstances.settings.radialMenuModifier,
            ExtendedGraphInstances.settings.pinNodeModifier
        ];
        const leftClickModifiers = [
            ExtendedGraphInstances.settings.selectNodeModifier
        ];
        const rightClickCompatibility = rightClickModifiers.unique().length === rightClickModifiers.length;
        const leftClickCompatibility = leftClickModifiers.unique().length === leftClickModifiers.length;

        const warnings: string[] = [];
        if (!rightClickCompatibility) {
            warnings.push(t("inputs.rightClickIncompatibility"));
        }
        if (!leftClickCompatibility) {
            warnings.push(t("inputs.leftClickIncompatibility"));
        }
        this.settingHeader.setDesc(warnings.join('\n'));
        this.settingHeader.descEl.toggleClass("error", !rightClickCompatibility && !leftClickCompatibility);
    }
}
