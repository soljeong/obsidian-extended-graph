# Local Agent Notes

This is a local-only working note for Codex/agent sessions on the fork at
`/home/jeong/obsidian-extended-graph`.

## Repo Context

- Upstream: `ElsaTam/obsidian-extended-graph`
- Fork: `soljeong/obsidian-extended-graph`
- Default branch: `master`
- Local development branch pattern: short fix branches such as
  `fix-save-default-state-pins`

## Local Obsidian Wiring

The main vault uses the fork build through file symlinks:

- `/home/jeong/vault/.obsidian/plugins/extended-graph/main.js`
- `/home/jeong/vault/.obsidian/plugins/extended-graph/manifest.json`
- `/home/jeong/vault/.obsidian/plugins/extended-graph/styles.css`

These point to the matching files in this repo. Keep vault-local plugin state
files such as `data.json` and `configs/` out of the repo.

## Build And Test

- Install dependencies with `npm ci`.
- Use `npm run dev` while iterating.
- Run `npm run build` before committing.
- For Android device testing, use `scripts/deploy-android-plugin.sh` from this
  repo instead of BRAT. It builds locally and copies the plugin bundle to the
  tablet over `ssh tab`.

## Current Local Patch Theme

The first local fix makes `Save default state` persist pinned nodes by saving
the full graph state from the active Extended Graph instance, instead of only
copying core graph engine options.

## Android Mobile Trial

- The current Android test vault is
  `/storage/emulated/0/Documents/essmt/doc`.
- The mobile trial plugin id is `extended-graph-mobile` so it can coexist with
  the desktop-oriented `extended-graph` install.
- The initial mobile trial changed only the deployed manifest fields:
  `id=extended-graph-mobile`, `name=Extended Graph Mobile`,
  `isDesktopOnly=false`.
- Result so far: the plugin loads on Android without code changes. Runtime
  feature compatibility still needs targeted testing.
- See `doc/local-android-deploy.md` for the current deploy loop and next checks.
