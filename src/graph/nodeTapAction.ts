import type { ExternalLinkOption, NodeTapAction } from "../settings/settings";

export type NodeClickIntent = "select-node" | "open-node" | "open-radial-menu";

export function shouldWrapNodeClick(settings: {
    openInNewTab: boolean;
    externalLinks: ExternalLinkOption;
    nodeTapAction: NodeTapAction;
}): boolean {
    return settings.openInNewTab
        || settings.externalLinks !== "none"
        || settings.nodeTapAction === "open-radial-menu";
}

export function resolveNodeClickIntent(options: {
    hasSelectionModifier: boolean;
    nodeTapAction: NodeTapAction;
}): NodeClickIntent {
    if (options.hasSelectionModifier) {
        return "select-node";
    }

    if (options.nodeTapAction === "open-radial-menu") {
        return "open-radial-menu";
    }

    return "open-node";
}
