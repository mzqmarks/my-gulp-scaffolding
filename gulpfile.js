// 实现这个项目的构建任务

const { src, dest, parallel, series } = require('gulp')
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
  return del(['dist'])
}

// 编译样式
const style = () => {
    return src('src/assets/styles/*.scss', { base: 'src'})
        .pipe(plugins.sass({ outputStyle: 'expanded'}))
        .pipe(dest('dist'))
}

// 编译 JS 文件
const script = ()=> {
    return src('src/assets/scripts/*.js', { base: 'src'})
        .pipe(plugins.babel({presets: ['@babel/preset-env']}))
        .pipe(dest('dist'))
}

// 编译 html 文件
const page = () => {
    return src('src/*.html', { base: 'src'})
        .pipe(plugins.swig(data))
        .pipe(dest('dist'))
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
  bs.init({
    files: 'dist/**',
    server: {
      baseDir: 'dist',
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

const compile = parallel(style, script, page, image, font)
const build = series(clean, parallel(compile, extra))
module.exports = {
    compile,
    build,
    clean,
    serve
}