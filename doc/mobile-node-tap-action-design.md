# Mobile Node Tap Action Design

Date: 2026-06-18

## Context

The current radial context menu is tied to desktop-style input:

- right click
- while holding a keyboard modifier

This works on desktop, but it is a poor fit for keyboard-free mobile use. The
Android trial plugin already loads successfully as `extended-graph-mobile`, so
the next step is to make node actions reachable without a hardware keyboard.

## Problem

Mobile users need a simple primary gesture for node actions. The current
default behavior opens the note directly, which leaves no easy path to the
radial menu on touch devices.

## Goals

- Allow users to choose what a short node tap does.
- Support a mobile-friendly mode where short tap opens the radial menu.
- Keep current desktop behavior available as the default.
- Make note opening still accessible when short tap opens the menu.
- Avoid gesture designs that are hard to discover or conflict with drag/zoom.

## Non-goals

- Redesign the whole radial menu.
- Remove the existing desktop right-click + modifier path.
- Add app restart automation or broader Android deployment changes.

## Approaches Considered

### 1. Configurable primary tap action

Add a setting that controls the primary node tap behavior.

Options:

- `Open note`
- `Open radial menu`

When set to `Open radial menu`, the radial menu must expose `Open` as a first
class action.

Pros:

- Simple mental model.
- Works on both desktop and mobile.
- No timing-based gesture recognition.
- Easy to test and document.

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

Add a configurable `Node tap action` setting under the `Inputs` section with
two values:

- `Open note`
- `Open radial menu`

Default to `Open note` to preserve existing behavior for current users.

## Proposed Behavior

### Settings

Add one new setting in `Inputs`:

- Label: `Node tap action`
- Values:
  - `Open note`
  - `Open radial menu`

This setting should apply across platforms. It is not mobile-only, but it is
primarily motivated by mobile usage.

### Node interaction rules

When `Node tap action = Open note`:

- Short tap / normal click keeps current default open behavior.
- Existing desktop radial-menu trigger remains available.

When `Node tap action = Open radial menu`:

- Short tap / normal click opens the radial menu instead of opening the note.
- Existing desktop radial-menu trigger still works and should open the same
  menu.

### Radial menu content

When `Node tap action = Open radial menu`, add `Open` as a visible top-level
menu action.

`Open` should perform the same action that the node’s default click currently
performs for that node type, including current logic for:

- normal note open
- open in new tab, where relevant
- external link handling
- tag node behavior, where relevant

The menu does not need a full redesign. This change is only about making the
existing default open path reachable when tap now opens the menu.

## Implementation shape

Expected touch points:

- settings model: add a persisted tap-action enum
- settings UI: expose the new dropdown in `Inputs`
- input handling: route normal node click through the configured tap action
- radial menu population: add `Open` item when needed

Keep the existing desktop right-click + modifier path intact. The new behavior
should layer on top of it, not replace it.

## Edge cases

- The new menu-first mode should not interfere with drag once dragging has
  actually started.
- The `Open` action in the radial menu must not diverge from existing default
  node-open behavior.
- If some node types cannot be opened meaningfully, the menu should either hide
  `Open` or map it to the current no-op/default path for that node type.

## Testing

### Desktop

- `Open note` mode preserves current click behavior.
- `Open radial menu` mode opens the radial menu on normal click.
- right-click + modifier still opens the radial menu in both modes.
- `Open` inside the radial menu opens the same target as the old click path.

### Android

- short tap opens the configured action reliably.
- graph dragging still works after movement starts.
- radial menu is usable without keyboard input.
- `Open` from the radial menu opens notes correctly.

## Decision summary

Approved direction:

- Make short-tap behavior configurable.
- Use `Open note` and `Open radial menu` as the first two options.
- Keep the default as `Open note`.
- If tap opens the radial menu, include `Open` inside the menu.
