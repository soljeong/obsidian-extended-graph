# Mobile Node Tap Action Design

Date: 2026-06-18
Branch: `fix-save-default-state-pins`

## Session Direction

Implement a configurable primary node tap action for Extended Graph so mobile
users can reach the radial context menu without a keyboard or right-click
modifier.

This session chooses the menu-first mobile direction, but keeps the current
desktop default unchanged:

- Default behavior remains `Open note`.
- Optional behavior is `Open radial menu`.
- When tap opens the radial menu, the radial menu must include an `Open` action
  that performs the same target-opening behavior as the old node click path.

No further product decision is blocking the first implementation pass.

## Context

The current radial context menu is tied to desktop-style input:

- right click
- while holding a keyboard modifier

This works on desktop, but it is a poor fit for keyboard-free mobile use. The
Android trial plugin already loads successfully as `extended-graph-mobile`, so
the next step is to make node actions reachable without a hardware keyboard.

The Android trial/deploy loop is documented in `doc/local-android-deploy.md`.
The trial plugin id is intentionally separate from `extended-graph` so mobile
testing does not overwrite the desktop-oriented install.

## Problem

Mobile users need a simple primary gesture for node actions. The current default
behavior opens the note directly, which leaves no easy path to the radial menu on
touch devices.

## Goals

- Allow users to choose what a short node tap does.
- Support a mobile-friendly mode where short tap opens the radial menu.
- Keep current desktop behavior available as the default.
- Make note opening still accessible when short tap opens the menu.
- Avoid gesture designs that are hard to discover or conflict with drag/zoom.
- Keep implementation scoped enough for one Codex implementation pass.

## Non-goals

- Redesign the whole radial menu.
- Remove the existing desktop right-click + modifier path.
- Add app restart automation or broader Android deployment changes.
- Add long-press or double-tap gesture recognition in this pass.
- Change the Android deployment script except as needed for build compatibility.

## Approaches Considered

### 1. Configurable primary tap action

Add a setting that controls the primary node tap behavior.

Options:

- `Open note`
- `Open radial menu`

When set to `Open radial menu`, the radial menu must expose `Open` as a
first-class action.

Pros:

- Simple mental model.
- Works on both desktop and mobile.
- No timing-based gesture recognition.
- Easy to test and document.
- Preserves backward compatibility by keeping the default as `Open note`.

Cons:

- Users who choose menu-first add one extra tap before opening notes.

### 2. Long press opens radial menu

Keep short tap as open, add long press as menu.

Pros:

- Preserves current direct-open flow.
- Feels familiar from some touch UIs.

Cons:

- Conflicts more easily with graph dragging and incidental movement.
- Harder to tune and test.
- Less discoverable in a graph canvas.

### 3. Double tap opens note, single tap opens menu

Make short tap always open the menu and use double tap for direct open.

Pros:

- Both actions stay available without extra menu configuration.

Cons:

- Double-tap timing and accidental activation add complexity.
- Worse fit for a dense, draggable graph surface.
- Higher implementation and QA cost for limited gain.

## Recommendation

Use approach 1.

Add a configurable `Node tap action` setting under the `Inputs` section with two
values:

- `Open note`
- `Open radial menu`

Default to `Open note` to preserve existing behavior for current users.

## Proposed Behavior

### Settings

Add one new persisted setting in `Inputs`:

- Internal setting name: `nodeTapAction`
- Suggested type: `'open-note' | 'open-radial-menu'`
- Label: `Node tap action`
- Values:
  - `Open note`
  - `Open radial menu`
- Default: `open-note`

This setting applies across platforms. It is not mobile-only, but it is
primarily motivated by mobile usage.

This setting is independent from the existing `Radial context menu (right
click)` setting. Users may keep the desktop right-click + modifier trigger while
also choosing what normal tap/click does.

### Node interaction rules

When `Node tap action = Open note`:

- Short tap / normal click keeps current default open behavior.
- Existing desktop radial-menu trigger remains available.

When `Node tap action = Open radial menu`:

- Short tap / normal click opens the radial menu instead of opening the note.
- Existing desktop radial-menu trigger still works and should open the same menu.
- The radial menu is positioned at the target node when possible, matching the
  current `RadialMenuManager.open()` node-centered behavior.

### Event precedence

Preserve existing input precedence:

1. If graph/node dragging has started, do not fire the tap action.
2. If the left-click selection modifier is pressed, keep the existing selection
   behavior.
3. Otherwise, apply `nodeTapAction` to the normal node click/tap.
4. Keep right-click + radial modifier behavior intact.
5. Keep right-click + pin modifier behavior intact.

The implementation should prefer the existing renderer node-click path over new
low-level pointer timing logic. This avoids adding long-press/double-tap style
thresholds and reduces drag conflicts.

### Radial menu content

When `Node tap action = Open radial menu`, add `Open` as a visible top-level menu
action.

`Open` should perform the same action that the node's default click currently
performs for that node type, including current logic for:

- normal note open
- open in new tab, where relevant
- external link handling
- tag node behavior, where relevant
- default core graph fallback behavior

The menu does not need a full redesign. This change is only about making the
existing default open path reachable when tap now opens the menu.

## Implementation Plan

### 1. Settings model

Touch point: `src/settings/settings.ts`

Add a new exported type near the existing input-related types:

```ts
export type NodeTapAction = 'open-note' | 'open-radial-menu';
```

Add `nodeTapAction: NodeTapAction` to `ExtendedGraphSettings` under the `Inputs`
section.

Set the default in `DEFAULT_SETTINGS`:

```ts
nodeTapAction: 'open-note',
```

Compatibility requirement: existing saved settings without this field must keep
working through the default settings merge path.

### 2. Settings UI

Touch point: `src/settings/settingInputs.ts`

Add a new `addNodeTapAction()` method and call it from `addBody()`, preferably
before the right-click radial menu setting so the primary tap behavior is visible
first.

Suggested dropdown values:

- `open-note` -> `Open note`
- `open-radial-menu` -> `Open radial menu`

Save settings on change using the same pattern as existing input settings.

### 3. i18n

Touch points:

- `i18n/en.json`
- `i18n/fr.json`
- `i18n/zh.json`

Add strings for:

- setting label: `Node tap action`
- setting description: short explanation that this controls normal node tap/click
- option: `Open note`
- option: `Open radial menu`
- radial menu action title: `Open`

Translation quality for non-English files is not a blocker for first pass, but
all referenced keys must exist so the build does not regress.

### 4. Input handling

Touch point: `src/graph/inputsManager.ts`

Current risk: `changeNodeOnClick()` only wraps `renderer.onNodeClick` when
`openInNewTab` is enabled or external links are enabled. The new menu-first mode
must also wrap `renderer.onNodeClick`.

Update the wrapper condition so `renderer.onNodeClick` is replaced when any of
these is true:

- `openInNewTab`
- `externalLinks !== "none"`
- `nodeTapAction === "open-radial-menu"`

Refactor the existing open behavior from `onNodeClick()` into a reusable helper,
for example:

```ts
openNodeFromGraph(e: UserEvent | null, id: string, type: string): void
```

The helper should contain the existing non-selection open path:

- external URL handling
- open-in-new-tab handling
- core default click fallback

Keep selection modifier handling in `onNodeClick()` before applying the tap
action.

Suggested flow:

```ts
private onNodeClick(e: UserEvent | null, id: string, type: string): void {
    if (this.shouldSelectNode(e)) {
        this.instances.nodesSet.selectNodes([this.instances.renderer.nodeLookup[id]]);
        return;
    }

    if (this.instances.settings.nodeTapAction === 'open-radial-menu') {
        const radialMenu = new RadialMenuManager(this.instances, id, type);
        radialMenu.open(null);
        return;
    }

    this.openNodeFromGraph(e, id, type);
}
```

Avoid calling `this.instances.renderer.onNodeClick` from the new radial menu
`Open` action, because after wrapping it may point back to the plugin wrapper and
can recurse. Reuse the extracted helper instead.

### 5. Radial menu `Open` action

Touch point: `src/ui/radialMenu.ts`

Add a top-level `Open` item when `nodeTapAction === 'open-radial-menu'`.

Suggested behavior:

- Insert `Open` near the beginning of `allItems`, before `Info` and `Pin`, so it
  is easy to find on mobile.
- `Open` calls the extracted input helper, for example:

```ts
this.instances.graphEventsDispatcher.inputsManager.openNodeFromGraph(null, this.nodeID, this.nodeType);
```

- Close the radial menu after invoking `Open`.

If TypeScript visibility requires it, make the helper public or add a narrow
public method with a clear name such as `openNodeFromRadialMenu()`.

### 6. Preserve existing right-click behaviors

Do not remove or replace the current right-click radial menu and pin paths.

Expected unchanged behavior:

- right-click + configured radial modifier opens radial menu
- right-click + configured pin modifier toggles pin
- normal right-click falls back to the core graph context menu

### 7. Build and deploy validation

Local Codex should run:

```bash
npm run build
```

For Android manual validation, use:

```bash
./scripts/deploy-android-plugin.sh
```

Do not add app restart automation in this pass.

## Edge Cases

- The new menu-first mode should not interfere with drag once dragging has
  actually started.
- The `Open` action in the radial menu must not diverge from existing default
  node-open behavior.
- If some node types cannot be opened meaningfully, the `Open` action should map
  to the current core/default path rather than inventing a new behavior.
- If no node circle can be found, radial menu opening should fall back to event
  coordinates when available. For tap-action opening, node-centered positioning
  is enough because `RadialMenuManager.open(null)` already uses the node when it
  can find it.
- The setting should work in both global graph and local graph views.

## Testing Checklist

### Desktop

- With default settings, normal click still opens notes as before.
- With `Node tap action = Open note`, external URL nodes still follow the
  existing external-link behavior.
- With `Node tap action = Open note`, `Open nodes in new tab` still works.
- With `Node tap action = Open radial menu`, normal click opens the radial menu.
- With `Node tap action = Open radial menu`, `Open` inside the radial menu opens
  the same target as the old click path.
- With `Node tap action = Open radial menu`, selection modifier + click still
  selects nodes instead of opening the radial menu.
- Right-click + radial modifier still opens the radial menu in both tap modes.
- Right-click + pin modifier still toggles pin in both tap modes.
- Normal right-click still falls through to the core graph context menu when no
  plugin modifier applies.
- Global graph and local graph both behave consistently.

### Android

- Plugin still loads as `extended-graph-mobile` after deploy.
- Settings screen opens and persists `Node tap action`.
- With `Open note`, short tap opens notes as before.
- With `Open radial menu`, short tap opens radial menu reliably.
- Radial menu is usable without keyboard input.
- `Open` from the radial menu opens notes correctly.
- Graph dragging still works after movement starts.
- Pin action remains usable from the radial menu.

## Completion Criteria

Implementation is complete when all of the following are true:

- `nodeTapAction` exists in the persisted settings model and defaults to
  `open-note`.
- The Inputs settings UI exposes `Node tap action` with `Open note` and
  `Open radial menu` options.
- Normal click/tap is wrapped when `nodeTapAction === 'open-radial-menu'`, even
  if `openInNewTab` is false and external links are disabled.
- Existing node-open behavior is reusable from both normal click and radial menu
  `Open`.
- Radial menu includes an `Open` item in menu-first mode.
- Existing right-click radial menu and pin modifier behavior still works.
- `npm run build` succeeds.
- Android manual validation has at least checked load, setting persistence,
  short tap to radial menu, radial `Open`, and dragging.

## Blocked Stop Conditions

Stop and report instead of broadening scope if any of the following happen:

- Obsidian's core graph click API differs from the current assumptions enough
  that preserving default open behavior requires a larger redesign.
- Mobile tap events do not reach the existing renderer node-click path.
- The extracted open helper cannot safely reuse core fallback behavior without
  recursion or lost default behavior.
- `npm run build` fails for reasons unrelated to this change and cannot be
  isolated.

## Decisions Left To User

No decision is required before the first implementation pass.

Optional later decisions, after manual testing:

- Whether Android should default to `Open radial menu` in the trial build only.
- Whether the `Open` radial item should always be visible, even when tap action
  remains `Open note`.
- Whether long-press should be considered in a later iteration.

## Decision Summary

Approved direction:

- Make short-tap behavior configurable.
- Use `Open note` and `Open radial menu` as the first two options.
- Keep the default as `Open note`.
- If tap opens the radial menu, include `Open` inside the menu.
- Implement through the existing node-click path rather than adding new gesture
  timing logic.
