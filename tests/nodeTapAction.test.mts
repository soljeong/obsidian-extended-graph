import assert from "node:assert/strict";
import {
    resolveNodeClickIntent,
    shouldWrapNodeClick,
} from "../src/graph/nodeTapAction.ts";

assert.equal(
    shouldWrapNodeClick({
        openInNewTab: false,
        externalLinks: "none",
        nodeTapAction: "open-radial-menu",
    }),
    true,
    "menu-first mode must wrap onNodeClick even without new-tab or external links",
);

assert.equal(
    shouldWrapNodeClick({
        openInNewTab: false,
        externalLinks: "none",
        nodeTapAction: "open-note",
    }),
    false,
    "default note-open mode should not wrap solely because of tap action",
);

assert.equal(
    resolveNodeClickIntent({
        hasSelectionModifier: true,
        nodeTapAction: "open-radial-menu",
    }),
    "select-node",
    "selection modifier must keep precedence over menu-first tap action",
);

assert.equal(
    resolveNodeClickIntent({
        hasSelectionModifier: false,
        nodeTapAction: "open-radial-menu",
    }),
    "open-radial-menu",
    "menu-first mode should route plain tap to the radial menu",
);

assert.equal(
    resolveNodeClickIntent({
        hasSelectionModifier: false,
        nodeTapAction: "open-note",
    }),
    "open-node",
    "note-open mode should preserve the default open path",
);

console.log("nodeTapAction tests passed");
