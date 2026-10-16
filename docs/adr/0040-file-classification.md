# Classification is deterministic and path overrides stop at binary

A file is binary when its first 8 KB contains a NUL byte or its extension is one of `png`, `jpg`, `jpeg`, `gif`, `webp`, `ico`, `icns`, `pdf`, `zip`, `gz`, `tgz`, `bz2`, `7z`, `rar`, `jar`, `wasm`, `class`, `exe`, `dll`, `so`, `dylib`, `bin`, `woff`, `woff2`, `ttf`, `otf`, `eot`, `mp3`, `mp4`, `mov`, `avi`, `webm`, `sqlite`, or `db`. A file is minified when its name contains `.min.` or any line exceeds 1,000 characters. A file is vendored when a path segment is `vendor`, `third_party`, or `node_modules`. A file is generated when one of its first 40 lines contains `@generated`, `Code generated`, or `DO NOT EDIT`, case-insensitively, or when trusted configuration lists its path.

These files are excluded from semantic review. They still receive classification and secret detection. Trusted configuration may explicitly include a path that a path rule excluded. It cannot include a file detected as binary.

## Considered Options

- Let the model decide which files look generated.
- Let configuration force a binary file into semantic review.

## Consequences

- A long line in an otherwise ordinary source file excludes that file and coverage says it was minified.
- `package-lock.json` and its equivalents are lockfiles, not vendored files. They are still excluded from semantic review.
