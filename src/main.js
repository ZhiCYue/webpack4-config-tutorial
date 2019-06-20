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
