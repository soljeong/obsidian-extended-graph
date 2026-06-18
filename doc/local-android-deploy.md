# Local Android Deploy Notes

This fork has a local Android test loop that does not use BRAT.

## Goal

Keep desktop development local to this repo, then copy built artifacts to the
Android tablet over `ssh tab`.

## Current Target

- Vault path: `/storage/emulated/0/Documents/essmt/doc`
- Plugin directory:
  `/storage/emulated/0/Documents/essmt/doc/.obsidian/plugins/extended-graph-mobile`
- Trial plugin id: `extended-graph-mobile`
- Trial plugin name: `Extended Graph Mobile`

The trial plugin id is separate from `extended-graph` so Android testing does
not overwrite the desktop-oriented install.

## Deploy Command

```bash
cd /home/jeong/obsidian-extended-graph
./scripts/deploy-android-plugin.sh
```

Default behavior:

1. Run `npm run build` locally.
2. Create a temporary manifest with:
   - `id=extended-graph-mobile`
   - `name=Extended Graph Mobile`
   - `isDesktopOnly=false`
3. Copy `main.js`, `manifest.json`, and `styles.css` to the Android vault over
   `ssh tab`.

Useful flags:

```bash
./scripts/deploy-android-plugin.sh --no-build
./scripts/deploy-android-plugin.sh --plugin-id my-test-id --plugin-name "My Test Plugin"
./scripts/deploy-android-plugin.sh --vault /storage/emulated/0/Documents/other-vault
```

## Session Decisions

- Use `ssh tab` as the main device handoff path. It is more convenient than
  BRAT or adb for this setup.
- Do not add app restart automation yet. Relaunching Obsidian remains manual.
- First mobile experiment was intentionally minimal: change only the deployed
  manifest fields and verify whether the plugin loads at all.
- Result: the plugin loads on Android in this minimal form.

## Next Checks

- Confirm global graph and local graph render correctly.
- Confirm settings open and persist on Android.
- Check desktop-oriented features first for failures:
  - SVG export
  - clipboard interactions
  - any file or path handling that assumes desktop behavior
