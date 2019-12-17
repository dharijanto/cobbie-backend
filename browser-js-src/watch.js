const fs = require('fs')
const path = require('path')

const Inotify = require('inotify').Inotify
const inotify = new Inotify()

const browserify = require('browserify')
const log = require('fancy-log')
const tsify = require('tsify')
const watchify = require('watchify')

// Create browserify instance that is watching the given module
function watchModule (module) {
  log(`Watching module: ${module.input}...`)
  const b = browserify(
    [path.join(__dirname, 'src', module.input, 'main.ts'), path.join(__dirname, 'src/index.d.ts')],
      {cache: {}, packageCache: {}, debug: true})
  // When option 'files: []' passed, only browserify entry point is watched.
  // Otherwise, any changes in any of the .ts file, even unrelated ones, will trigger 'update' events
  .plugin(tsify, {target: 'es6', files: []})
  .transform('babelify', {presets: ['es2015']})
  .transform({global: true}, 'browserify-shim')
  /* .transform('uglifyify', {global: true}) */
  .plugin(watchify)

  b.on('update', () => bundle(b, module))
  b.on('error', err => log.error(err.message))

  return b
}

// Given browserify bundle, ask it to produce a bundle
function bundle (b, module) {
  log(`Bundling module: ${module.input}...`)
  b.bundle()
    .on('error', err => log.error(err.message))
    .pipe(fs.createWriteStream(getAssetFolder(module.output, module.input)))
    .on('finish', () => {
      log(`Finished Bundling module: ${module.input}...`)
    })
}

// Enumerate ./src directory to find *-cms and *-app folder, then build and watch them
// The main.ts file inside the directory is going to be bundled to respective cms or app output folder
const sourceDir = path.join(__dirname, 'src')
fs.readdirSync(sourceDir).filter(filename => {
  const split = filename.split('-')
  // Valid source folder ends with '-cms' or '-app'
  const validSourceDirName = split[split.length - 1] === 'cms' || split[split.length - 1] === 'app'
  return fs.statSync(path.join(sourceDir,filename)).isDirectory() && validSourceDirName
}).map(dir => {
  const split = dir.split('-')
  if (split.length < 2) {
    throw new Error('Unexpected browser-js-src source directory: ' + dir)
  }
  return {
    input: dir,
    output: split[split.length - 1]
  }
}).forEach(module => {
  const b = watchModule(module)
  bundle(b, module)
})

// Start inotify watcher to watch for newly created folder, so that we don't have to re-build
// when we added new folder
inotify.addWatch({
  path: path.join('src'),
  watch_for: Inotify.IN_CREATE | Inotify.IN_ONLYDIR,
  callback: event => {
    const split = event.name.split('-')
    // We found a new module folder
    // TODO: Handle create and delete
    if (event.mask & Inotify.IN_ISDIR && split.length > 1 &&
        split[split.length -1] === 'cms' || split[split.length -1] === 'app') {
      log('Found a module folder: ' + event.name + ' watching for main.ts inside of it to be created.')
      const dir = event.name
      const moduleType = split[split.length - 1]
      // Now we need to watch until a main.ts is created
      inotify.addWatch({
        path: path.join('src', event.name),
        watch_for: Inotify.IN_CREATE,
        callback: event2 => {
          // TODO: Handle deletion as well
          if (!(event2.mask & Inotify.IN_ISDIR) && event2.name === 'main.ts') {
            const module = {
              input: dir,
              output: moduleType
            }
            log('Found a main.ts for module=' + JSON.stringify(module))
            const b = watchModule(module)
            bundle(b, module)
            // No longer need to watch
            inotify.removeWatch(event2.watch)
          }
        }
      })
    }
  }
})

function getAssetFolder(outputFolder, moduleName) {
  if (outputFolder === 'app') {
    return path.join(__dirname, `../dist/${outputFolder}/views/assets/js/${moduleName}-bundle.js`)
  } else if (outputFolder === 'cms') {
    return path.join(__dirname, `../dist/${outputFolder}/views/v1/assets/js/${moduleName}-bundle.js`)
  } else {
    throw new Error('Unexpected outputFolder=' + outputFolder)
  }
}

