/* @refresh reload */
import '#/assets/index.css'
import '#/assets/fonts.css'
import { render } from 'solid-js/web'
import App from '#/App.js'

render(() => <App />, document.getElementById('root') as HTMLElement)
