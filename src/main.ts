import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import package_data from './../package.json'

console.log('Version: '+package_data.version)

createApp(App).mount('#app')
