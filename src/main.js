import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import Study from './views/Study.vue'
import Tutorial from './views/Tutorial.vue'

const routes = [
  { path: '/', redirect: '/study' },
  { path: '/study', name: 'Study', component: Study },
  { path: '/study/:categoryId', name: 'StudyCategory', component: Study },
  { path: '/tutorial/:id', name: 'Tutorial', component: Tutorial },
  { path: '/tutorial/:id/:articleId', name: 'TutorialArticle', component: Tutorial }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app') 