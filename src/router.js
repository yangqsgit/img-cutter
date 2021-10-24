import cutpic from './view/cutPic'
import VueRouter from 'vue-router'

const routes = [
    { path: '/', component: cutpic }
]


const router = new VueRouter({
    routes
})
export default router