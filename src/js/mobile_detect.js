import MobileDetect from "mobile-detect"
import store from "./store.js"

export default {
    start() {
        // enable detection of touch/mouse
        // guess first by user agent then detect touch events
        var touchListener = () => {
            store.commit("UPDATE_MOUSE_ENABLED", false)
            window.removeEventListener("touchstart", touchListener)
        }

        var md = new MobileDetect(window.navigator.userAgent)
        if (md.mobile() == null) {
            store.commit("UPDATE_MOUSE_ENABLED", true)
            window.addEventListener("touchstart", touchListener)
        }
    }
}
