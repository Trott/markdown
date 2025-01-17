const { basename, dirname, extname, join } = require('path')
const debug = require('debug')('@metalsmith/markdown')
// marked main is set to 'src/marked' which contains unsupported syntax for Node 8-
const marked = require('marked/lib/marked')

/**
 * Check if a `file` is markdown
 * @param {String} filePath
 * @return {Boolean}
 */
function isMarkdown(filePath) {
  return /\.md$|\.markdown$/.test(extname(filePath))
}

/**
 * @typedef Options
 * @property {String[]} keys - Key names of file metadata to render to HTML
 **/

/**
 * Metalsmith plugin to convert markdown files.
 * @param {Options} [options]
 * @return {import('metalsmith').Plugin}
 */
const plugin = function (options) {
  options = options || {}
  const keys = options.keys || []

  return function (files, metalsmith, done) {
    setImmediate(done)
    Object.keys(files).forEach(function (file) {
      debug('checking file: %s', file)
      if (!isMarkdown(file)) return
      const data = files[file]
      const dir = dirname(file)
      let html = basename(file, extname(file)) + '.html'
      if ('.' != dir) html = join(dir, html)

      debug('converting file: %s', file)
      const str = marked(data.contents.toString(), options)
      data.contents = Buffer.from(str)
      keys.forEach(function (key) {
        if (data[key]) {
          data[key] = marked(data[key].toString(), options)
        }
      })

      delete files[file]
      files[html] = data
    })
  }
}

module.exports = plugin
