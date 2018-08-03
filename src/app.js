import "vue-material/dist/vue-material.css"
import "./style/theme.scss"
import "./style/app.styl"

import Vue from "vue"
import VueMaterial from "vue-material"
import VeeValidate from "vee-validate"

Vue.use(VueMaterial)
Vue.use(VeeValidate)

// try to detect if on mobile and format appropriately
import mobileDetect from "./js/mobile_detect.js"
mobileDetect.start()

import router from "./js/router/router.js"
import store from "./js/store.js"
import autosave from "./js/autosave.js"

// once app is started, start autosaving
var unwatch = store.watch(state => state.app_state, app_state => {
    if (app_state !== "started") {
        return
    }
    unwatch()
    autosave.start()
})

import APPSApp from "./components/app.vue"

var App = new (Vue.extend(APPSApp))({
    el: "#root",
    router,
    store
})

export default App
