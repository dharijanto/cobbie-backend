var fs = require('fs')
var path = require('path')

var gulp = require('gulp')
var gulpCopy = require('gulp-copy')
var sass = require('gulp-sass')
var log = require('fancy-log')
var sourcemaps = require('gulp-sourcemaps')
var ts = require('gulp-typescript')
var tsconfig = require('tsconfig')
var uglify = require('gulp-uglify-es').default
var watch = require('gulp-watch')

var project = tsconfig.loadSync(path.join(__dirname, 'tsconfig.json'))
var tsProject = ts.createProject('tsconfig.json')

// NCloud Site Smplementation (i.e. filos, tokowatch, etc)
const sitesDepsFiles = [
  'src/app/views/**',
  'src/cms/views/**',
  'src/app-config.js.dist'
]
const sitesFiles = project.config.include
  .concat(project.config.exclude.map(excludePath => '!' + excludePath))

gulp.task('compileSites', gulp.series(function () {
  return gulp.src(sitesFiles)
    .pipe(sourcemaps.init())
    .pipe(tsProject()).js
    .on('error', swallowError)
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/'))
}))

gulp.task('compileSitesWithoutUglify', gulp.series(function () {
  return gulp.src(sitesFiles)
  .pipe(sourcemaps.init())
  .pipe(tsProject()).js
  .pipe(sourcemaps.write())
  .on('error', swallowError)
  .pipe(gulp.dest('dist/'))
}))

gulp.task('copySitesDeps', gulp.series(function () {
  return gulp.src(sitesDepsFiles)
    .pipe(gulpCopy('dist/', {prefix: 1}))
}))

gulp.task('watchSites', gulp.series(function () {
  return gulp.watch(sitesFiles, gulp.series(['compileSitesWithoutUglify']))
}))

gulp.task('watchSitesDeps', gulp.series(function () {
  return watch(sitesDepsFiles, vynil => {
    log('Site deps changes: ' + vynil.history[0])
    // src/[path to file]/file.ext
    const srcFile = vynil.history[0].slice((vynil.cwd + '/').length)
    // dest/[path to file]/file.ext
    const destFile = 'dist/' + srcFile.slice('src/'.length)
    switch (vynil.event) {
      case 'add':
      case 'change':
        gulp.src(srcFile).pipe(gulpCopy('dist/', {prefix: 1}))
        break
      case 'unlink':
        fs.unlink(destFile, err => {
          if (err) {
            console.error(err)
          }
        })
        break
    }
  })
}))

gulp.task('sass', gulp.series(function () {
  return gulp.src('./src/app/views/assets/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./src/app/views/assets/css/'));
}))

gulp.task('watchSass', gulp.series(function () {
  // In order to be triggered when there's a new file added/removed, we
  // have to pass in relative path as first argument and the root directory as 'cwd'
  return gulp.watch('src/app/views/assets/sass/**/*.scss', { cwd: './' }, gulp.series(['sass']))
}))

gulp.task('watch', gulp.parallel(['compileSites', 'copySitesDeps', 'watchSites', 'watchSitesDeps', 'watchSass']))

function swallowError (error) {
  // If you want details of the error in the console
  log(error.toString())
  this.emit('end')
}
