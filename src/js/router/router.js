import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

import routes from "./routes.js"

const router = new VueRouter({
    routes
})

import store from "../store.js"
import setTitle from "./title.js"
import check404 from "./404.js"

// router initialization
router.beforeEach((to, from, next) => {
    if (store.state.app_state === "started") {
        next()
        return
    }

    // if app hasn't started, wait for it to start before allowing route to continue
    var unwatch = store.watch(state => state.app_state, app_state => {
        if (app_state !== "started") {
            return
        }
        unwatch()

        // watch signin status
        store.watch(state => state.signed_in, signed_in => {
            if (signed_in && router.currentRoute.name === "signin") {
                router.push({name: "dashboard"})
            } else {
                router.push({name: "signin"})
            }
        })

        // 404 and title handler
        router.beforeEach((to, from, next) => {
            var newRoute = check404(to)
            next(newRoute)
            if (!newRoute) {
                setTitle(to)
            }
        })

        // check 404 and set title on first route
        var newRoute = check404(to)
        next(newRoute)
        if (!newRoute) {
            setTitle(to)
        }
    })
})

export default router
