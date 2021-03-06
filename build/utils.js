const path = require('path')
const fs = require('fs')
const config = require('../config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const packageConfig = require('../package.json')

exports.assetsPath = function(_path) {
  const assetsSubDirectory =
    process.env.NODE_ENV === 'production' ? config.build.assetsSubDirectory : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

exports.getThemeConfig = function() {
  const pkgPath = path.join(__dirname, '../package.json')
  const pkg = fs.existsSync(pkgPath) ? require(pkgPath) : {}
  let theme = {}
  if (pkg.theme && typeof pkg.theme === 'string') {
    let cfgPath = pkg.theme
    // relative path
    if (cfgPath.charAt(0) === '.') {
      cfgPath = path.resolve(__dirname, '..', cfgPath)
    }
    const config = require(cfgPath)
    theme = config
  } else if (pkg.theme && typeof pkg.theme === 'object') {
    theme = pkg.theme
  }
  return theme
}

exports.cssLoaders = function(options) {
  options = options || {}

  const cssLoader = (loaderOptions = {}) => ({
    loader: 'css-loader',
    options: Object.assign({}, loaderOptions, {
      sourceMap: options.sourceMap
    })
  })

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions = {}) {
    const loaders = options.usePostCSS
      ? [cssLoader(loaderOptions.css ? loaderOptions.css : loaderOptions), postcssLoader]
      : [cssLoader(loaderOptions)]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions.less ? loaderOptions.less : loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return [MiniCssExtractPlugin.loader].concat(loaders)
    } else {
      return ['style-loader'].concat(loaders)
    }
  }

  return {
    css: generateLoaders(),
    'module\\.css': generateLoaders(null, {
      sourceMap: options.sourceMap,
      modules: true,
      camelCase: true,
      localIdentName: process.env.NODE_ENV === 'production' ? '[local]__[hash:base64:5]': '[name]--[local]--[hash:base64:5]'
    }),
    postcss: generateLoaders(),
    less: generateLoaders('less', {
      modifyVars: exports.getThemeConfig(),
      javascriptEnabled: true
    }),
    'module\\.less': generateLoaders('less', {
      css: {
        sourceMap: options.sourceMap,
        modules: true,
        camelCase: true,
        localIdentName: process.env.NODE_ENV === 'production' ? '[local]__[hash:base64:5]': '[name]--[local]--[hash:base64:5]'
      },
      less: { modifyVars: exports.getThemeConfig(), javascriptEnabled: true }
    }),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

exports.styleLoaders = function(options) {
  const output = []
  const loaders = exports.cssLoaders(options)
  for (const extension in loaders) {
    const loader = loaders[extension]
    let obj = {}
    if (extension === 'css') {
      obj = {
        test: filePath => /\.css$/.test(filePath) && !/\.module\.css$/.test(filePath),
        use: loader
      }
    } else if (extension === 'less') {
      obj = {
        test: filePath => /\.less$/.test(filePath) && !/\.module\.less$/.test(filePath),
        use: loader
      }
    } else {
      obj = {
        test: new RegExp('\\.' + extension + '$'),
        use: loader
      }
    }
    output.push(obj)
  }
  return output
}
exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}
