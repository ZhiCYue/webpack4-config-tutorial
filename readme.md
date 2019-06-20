## webpack4 常用插件及loader 配置

>参考连接：
>[https://www.jianshu.com/p/2cc8457f1a10](https://www.jianshu.com/p/2cc8457f1a10)
>

涉及到的插件&loader：
- `MiniCssExtractPlugin`
- `postcss-loader`
- `SplitChunksPlugin`
- `babel-loader`

下面将分别对其描述：

#### MiniCssExtractPlugin

通过`css-loader`、`style-loader` 处理后的css（或者less），最终会在html 中以style 标签的形式嵌入html 中。如果要想通过 link 的方式引入，则需要`MiniCssExtractPlugin`（在webpack3 中是`ExtractTextWebpackPlugin`）。

使用方式：
```js
npm install --save-dev mini-css-extract-plugin
```
在webpack.config.js 中引入并添加plugins：
```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
```

```js
new MiniCssExtractPlugin({
  filename: "[name].css"
}),
```

修改css 和less 的rules：
```js
  {
    test: /.css$/,
    use: [
      // 'style-loader',
      {
        loader: MiniCssExtractPlugin.loader
      },
      'css-loader'
    ]
  },
  {
    test: /.less$/,
    use: [
      // 'style-loader',
      {
        loader: MiniCssExtractPlugin.loader
      },
      'css-loader',
      'less-loader'
    ]
  }
```

打包之后，可见index.html 的head 中通过link方式引入了css文件。


#### postcss-loader

postcss-loader 可以帮助我们处理 css，如自动添加浏览器前缀。

```js
npm i -D postcss-loader autoprefixer
```

在根目录下创建postcss.config.js:

```js
const autoprefixer = require('autoprefixer')

module.exports = {
  plugins: [
    autoprefixer({
      browsers: ['last 5 version']
    })
  ]
}
```

修改css 和less 的rules：
```js
{
   test: /\.css$/,
   use: [
     // 'style-loader',
     {
       loader: MiniCssExtractPlugin.loader
     },
     { loader: 'css-loader', options: { importLoaders: 1 } },
     'postcss-loader'
   ]
 },
 {
   test: /\.less$/,
   use: [
     // 'style-loader',
     {
       loader: MiniCssExtractPlugin.loader
     },
     'css-loader',
     'postcss-loader',
     'less-loader'
   ]
 }
```

在 modal.css（代码中的css文件）中加入：
```css
.flex{
    display: flex;
}
```

打包之后打开main.css （打包后的css），可以看到浏览器前缀已经加上了。
```css
.flex{
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
```

(可能会提示配置方式需要替换，这里暂不描述)


#### SplitChunksPlugin

起初，chunks(代码块)和导入他们中的模块通过webpack内部的父子关系图连接.在webpack3中，通过CommonsChunkPlugin来避免他们之间的依赖重复。而在webpack4中`CommonsChunkPlugin`被移除，取而代之的是 `optimization.splitChunks` 和 `optimization.runtimeChunk` 配置项，下面展示它们将如何工作。


webpack将根据以下条件自动拆分代码块：
- 会被共享的代码块或者 node_mudules 文件夹中的代码块
- 体积大于30KB的代码块（在gz压缩前）
- 按需加载代码块时的并行请求数量不超过5个
- 加载初始页面时的并行请求数量不超过3个


`SplitChunksPlugin` 的默认配置：
```js
splitChunks: {
    chunks: "async",
    minSize: 30000, // 模块的最小体积
    minChunks: 1, // 模块的最小被引用次数
    maxAsyncRequests: 5, // 按需加载的最大并行请求数
    maxInitialRequests: 3, // 一个入口最大并行请求数
    automaticNameDelimiter: '~', // 文件名的连接符
    name: true,
    cacheGroups: { // 缓存组
        vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10
        },
        default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
        }
    }
}
```

cacheGroups

缓存组应该是`SplitChunksPlugin`中最有趣的功能了。在默认设置中，会将 node_mudules 文件夹中的模块打包进一个叫 vendors的bundle中，所有引用超过两次的模块分配到  default bundle 中。更可以通过 priority 来设置优先级。

chunks

chunks属性用来选择分割哪些代码块，可选值有：'all'（所有代码块），'async'（按需加载的代码块），'initial'（初始化代码块）。

#### 在项目中添加SplitChunksPlugin

例如下面代码，在`main.js` 中引入了自己编写的组件（`modal`），同时也引入了node_modules 找那个的组件（`lodash、axios`）

modal 组件内容略

```js
// main.js
import Modal from './components/modal/modal'
import './assets/style/common.less'
import _ from 'lodash'
import axios from 'axios'
const App = function () {
  let div = document.createElement('div')
  div.setAttribute('id', 'app')
  document.body.appendChild(div)
  let dom = document.getElementById('app')
  let modal = new Modal()
  dom.innerHTML = modal.template({
    title: '标题',
    content: '内容',
    footer: '底部'
  })
}
const app = new App()
console.log(_.camelCase('Foo Bar'))
axios.get('aaa')
```

webpack.config.js

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'development',
  entry: ['./src/main.js'],
  output: {
    filename: '[name].js',
    path: path.resolve('dist')
  },
  module: {
    rules: [
      {
        test: /.ejs$/,
        use: ['ejs-loader']
      },
      {
        test: /.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: 'vendors',
      hash: true
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css"
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'initial',
      automaticNameDelimiter: '.',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: 1
        }
      }
    },
    runtimeChunk: {
      name: entrypoint => `manifest.${entrypoint.name}`
    }
  }
}
```

则打包后的代码：
<img src="https://img-blog.csdnimg.cn/20190620000837467.png" width="40%">

#### webpack-bundle-analyzer
webpack-bundle-analyzer 可以方便的展示打包后的bundle 的依赖。

```js
npm i webpack-bundle-analyzer -D
```

引入：
```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
```
在插件中添加：
```js
new BundleAnalyzerPlugin()
```
<img src="https://img-blog.csdnimg.cn/20190620000742975.png" width="80%">


#### babel-loader

安装：
```js
npm install -D babel-loader @babel/core @babel/preset-env webpack
```

webpack.config.js 中加入新的loader配置：
```js
{
    test: /\.js$/,
    loader: 'babel-loader',
    exclude: /node_modules/
}
```
在项目根目录下创建一个 .babelrc 文件，添加代码：
```js
// .babelrc
{
  "presets": [
    "@babel/preset-env"
  ]
}
```

我们还希望能够在项目对一些组件进行懒加载，所以还需要一个Babel插件：
```js
npm i babel-plugin-syntax-dynamic-import -D
```

在 .babelrc 文件中加入plugins配置：
```js
{
  "presets": [
    "@babel/preset-env"
  ],
  "plugins": [
    "syntax-dynamic-import"
  ]
}
```
在src 目录下创建 helper.js：
```js
// helper.js
console.log('this is helper')
```

再来修改我们的 main.js ：
```js
import 'babel-polyfill'
import Modal from './components/modal/modal'
import './assets/style/common.less'
import _ from 'lodash'
const App = function () {
  let div = document.createElement('div')
  div.setAttribute('id', 'app')
  document.body.appendChild(div)
  let dom = document.getElementById('app')
  let modal = new Modal()
  dom.innerHTML = modal.template({
    title: '标题',
    content: '内容',
    footer: '底部'
  })
  let button = document.createElement('button')
  button.innerText = 'click me'
  button.onclick = () => {
    const help = () => import('./helper')
    help()
  }
  document.body.appendChild(button)
}
const app = new App()
console.log(_.camelCase('Foo Bar'))
```

当button点击时，加载 helper 然后调用。
多了一个 0.bundle.js，在浏览器打开 dist/index.html ，打开 network查看，0.bundle.js并未加载;当点击button之后，发现浏览器请求了0.bundle.js，控制台也打印出了数据。

>由于 Babel 只转换语法(如箭头函数)， 你可以使用 babel-polyfill 支持新的全局变量，例如 Promise 、新的原生方法如 String.padStart (left-pad) 等。

安装：
```js
npm install --save-dev babel-polyfill
```
在入口文件引入就可以了：

```js
import 'babel-polyfill'
```

#### 使用Eslint审查代码

在项目中加入eslint配置，来审查校验代码，这样能够避免一些比较低级的错误。

**安装**

eslint-config-standard 是一种较为成熟通用的代码审查规则，这样就不用我们自己去定义规则了，使用起来非常方便，记住还需要安装一些依赖插件：

```js
npm install --save-dev eslint eslint-config-standard eslint-plugin-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node
```

**配置**
在项目根目录下创建 .eslintrc 文件：

```js
{
  "extends": "standard",
  "rules": {
    "no-new": "off"
  }
}
```

在vue项目中，.vue文件中的 script标签内的代码，eslint 是无法识别的，这时就需要使用插件： eslint-plugin-html
```js
npm i eslint-plugin-html -D
```

然后在 .eslintrc 中配置该插件：
```js
{
  "extends": "standard",
  "plugins": [
    "html"
  ],
  "rules": {
    "no-new": "off"
  }
}
```

这样就能解析 .vue文件中的JS代码了，官方也是如此推荐。

**使用**
在 package.json 文件中添加一条 script：
```js
"scripts": {
  "build": "cross-env NODE_ENV=production webpack --config webpack.config.js --progress --inline --colors",
  "lint": "eslint --ext .js --ext .vue src/"
}
```

运行：
```js
npm run lint
```

在项目前期没有加入eslint的情况下，后期加入必然会审查出许多错误。出现这么多错误之后，如果我们逐条手动去解决会非常耗时，此时可以借助eslint自动修复，方法也很简单。
只需要添加一条命令即可：

```js
"scripts": {
  "build": "cross-env NODE_ENV=production webpack --config config/webpack.config.js --progress --inline --colors",
  "lint": "eslint --ext .js --ext .vue src/",
  "lint-fix": "eslint --fix --ext .js --ext .jsx --ext .vue src/"
}
```

然后执行:
```js
npm run lint-fix
```

我们希望在开发过程中能够实时进行eslint代码审查，需要安装两个依赖：
```js
npm i eslint-loader babel-eslint -D
```

修改 .eslintrc：

```js
{
  "extends": "standard",
  "plugins": [
    "html"
  ],
  "rules": {
    "no-new": "off"
  },
  "parserOptions":{
    "parser": "babel-eslint"
  }
}
```

由于我们的项目使用了webpack并且代码都是经过Babel编译的，但是Babel处理过的代码有些语法可能对于eslint支持性不好，所以需要指定一个 parser。
下一步，在webpack.config.js中添加loader：

```js
{
  test: /\.(vue|js)$/,
  loader: 'eslint-loader',
  exclude: /node_modules/,
  enforce: 'pre'
 }
```

enforce: 'pre' 表示预处理，因为我们只是希望eslint来审查我们的代码，并不是去改变它，在真正的loader(比如：vue-loader)发挥作用前用eslint去检查代码。

**editorconfig**
editorconfig是用来规范我们的IDE配置的，在根目录创建 ```.editorconfig```文件：
```txt
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
```

这样就能在各种IDE使用相同的配置了。

>同样需要在IDE中安装editorconfig插件。

以上就是eslint的配置方法了。
