# assets

Image storage for PR screenshots only.

This branch is never merged into `develop` or `main` — it exists purely so PR descriptions can embed images via `raw.githubusercontent.com` links without bloating the project history with binaries.

Path convention: `pr-<number>/<app>-<screen-slug>-{before|after}.png`, where `<app>` is `app` or `admin`.

Managed by `pr-agent` as part of the `/implement` delivery flow. Do not open a pull request for this branch.
