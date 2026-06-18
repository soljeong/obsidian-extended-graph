import { Setting } from "obsidian";
import { ExtendedGraphSettingTab, ExtendedGraphInstances, getAllTagTypes, SettingInteractives, t, TAG_KEY, TagsSource } from "../../internal";

export class SettingTags extends SettingInteractives {

    constructor(settingTab: ExtendedGraphSettingTab) {
        super(settingTab, 'tags', TAG_KEY, t("features.ids.tags"), t("features.interactives.tags"), 'tags', t("features.interactives.tagsDesc"), true);
    }

    protected override addBody(): void {
        super.addBody();

        this.addTagsSource();

        // Show on graph
        this.elementsBody.push(new Setting(this.settingTab.containerEl)
            .setName(t("features.interactives.arcsAdd"))
            .setDesc(t("features.interactives.arcsAddTagDesc"))
            .addToggle(cb => {
                cb.setValue(ExtendedGraphInstances.settings.interactiveSettings[this.interactiveKey].showOnGraph);
                cb.onChange(value => {
                    ExtendedGraphInstances.settings.interactiveSettings[this.interactiveKey].showOnGraph = value;
                    ExtendedGraphInstances.plugin.saveSettings();
                })
            }).settingEl);
    }

    private addTagsSource(): void {
        this.elementsBody.push(new Setting(this.settingTab.containerEl)
            .setName(t("features.interactives.tagsSource"))
            .setDesc(t("features.interactives.tagsSourceDesc"))
            .addDropdown(cb => {
                cb.addOption("all", t("features.interactives.tagsSourceAll"));
                cb.addOption("frontmatter", t("features.interactives.tagsSourceFrontmatter"));
                cb.setValue(ExtendedGraphInstances.settings.interactiveSettings[this.interactiveKey].tagsSource ?? "all");
                cb.onChange(async (value: TagsSource) => {
                    ExtendedGraphInstances.settings.interactiveSettings[this.interactiveKey].tagsSource = value;
                    await ExtendedGraphInstances.plugin.saveSettings();
                    ExtendedGraphInstances.plugin.app.workspace.trigger(`extended-graph:settings-interactive-color-changed`, this.interactiveKey);
                })
            }).settingEl);
    }

    protected override isValueValid(name: string): boolean {
        return /^[^\u2000-\u206F\u2E00-\u2E7F'!"#$%&()*+,.:;<=>?@^`{|}~\[\]\\\s]+/.test(name);
    }

    protected override getPlaceholder(): string {
        return "tag";
    }

    protected override getAllTypes(): string[] {
        return SettingTags.getAllTypes();
    }

    static getAllTypes(): string[] {
        return getAllTagTypes(ExtendedGraphInstances.settings);
    }
}
