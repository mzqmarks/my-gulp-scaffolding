// 实现这个项目的构建任务

const { src, dest, parallel, series, watch } = require('gulp')
// 删除文件
const del = require('del')
// 开发服务器
const browserSycn = require('browser-sync')
const bs = browserSycn.create()
const plugins = require('gulp-load-plugins')() // 自动加载模块

const data = {
    menus: [
      {
        name: 'Home',
        icon: 'aperture',
        link: 'index.html'
      },
      {
        name: 'Features',
        link: 'features.html'
      },
      {
        name: 'About',
        link: 'about.html'
      },
      {
        name: 'Contact',
        link: '#',
        children: [
          {
            name: 'Twitter',
            link: 'https://twitter.com/w_zce'
          },
          {
            name: 'About',
            link: 'https://weibo.com/zceme'
          },
          {
            name: 'divider'
          },
          {
            name: 'About',
            link: 'https://github.com/zce'
          }
        ]
      }
    ],
    pkg: require('./package.json'),
    date: new Date()
}
// 删除文件
const clean = () => {
  return del(['dist', 'temp'])
}

// 编译样式
const style = () => {
    return src('src/assets/styles/*.scss', { base: 'src'})
        .pipe(plugins.sass({ outputStyle: 'expanded'}))
        .pipe(dest('temp')) // 创建一个临时 temp 文件夹
        .pipe(bs.reload({ stream: true }))
}

// 编译 JS 文件
const script = ()=> {
    return src('src/assets/scripts/*.js', { base: 'src'})
        .pipe(plugins.babel({presets: ['@babel/preset-env']}))
        .pipe(dest('temp'))
        .pipe(bs.reload({ stream: true }))
}

// 编译 html 文件
const page = () => {
    return src('src/*.html', { base: 'src'})
        .pipe(plugins.swig(data))
        .pipe(dest('temp'))
        .pipe(bs.reload({ stream: true }))
}

// 压缩图片
const image = () => {
    return src('src/assets/images/**', { base: 'src' })
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

// 字体文件
const font = () => {
    return src('src/assets/fonts/**', { base: 'src' })
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

// 处理 public 文件夹
const extra = () => {
  return src('public/**', {base: 'public'})
    .pipe(dest('dist'))
}

// 开启服务器
const serve = () => {
  // 监听文件变化
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/scripts/*.js', script)
  watch('src/*.html', page)
  // 开发阶段不用每次都监听变化所以将他们组合成一个任务
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)
  watch([
    'src/assets/images/**',
    'src/assets/fonts/**',
    'public/**'
  ], bs.reload)

  bs.init({
    notify: false,
    // files: 'dist/**', // 监听 dist 文件夹下所有文件的变化
    server: {
      baseDir: ['temp', 'src', 'public'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

// useref 打包文件引用路径处理
const useref = () => {
  return src('temp/*.html', { base: 'temp' })
    .pipe(plugins.useref({ searchPath: ['temp', '.'] }))

    // 压缩三种类型文件
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCss: true,
      minifyJs: true
    })))
    .pipe(dest('dist'))
}

const compile = parallel(style, script, page, )
const build = series(
  clean, 
  parallel(
    series(compile, useref),
    image, 
    font, 
    extra
  )
)
const develop = series(compile, serve)
module.exports = {
    compile,
    build,
    clean,
    serve,
    develop,
    useref
}