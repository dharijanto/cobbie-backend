# Quirks
## src/tsconfig.json
This file is not actually used for transpilation, because we don't transpile using
tsc directly, but we use browserify + tsify combo (hence the config is under watch.js).
However, it's required to get vscode to recognize the separate index.d.ts that exists
for browser-js-src code

## --max-old-space-size=4096
When compiling browser code, we need to append ```--max-old-space-size=4096``` because
otherwise the VM memory is capped by default. Since we're compiling each of the browser module
separately, it consumes quite some memory.