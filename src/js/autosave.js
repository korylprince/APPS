import store from "./store.js"

export default {
    timers: {
        save: null,
        mustSave: null
    },
    save() {
        window.clearTimeout(this.timers.save)
        window.clearTimeout(this.timers.mustSave)
        this.timers.save = null
        this.timers.mustSave = null
        if (store.state.signed_in && store.getters["db/dirty"]) {
            store.dispatch("db/check_save")
        }
    },
    start() {
        // make all attempts to save data on leaving page
        window.addEventListener("beforeunload", event => {
            if (store.state.signed_in && store.getters["db/dirty"]) {
                event.returnValue = "There are unsaved changes. Are you sure you want to leave?"
                store.dispatch("db/check_save")
            }
        })

        window.addEventListener("visibilitychange", () => {
            this.save()
        })

        // watch for changes and save
        // debounce save 3 seconds for up to 20 seconds
        store.watch((state, getters) => getters["db/db_json"], db => {
            // no timers are set
            if (this.timers.save == null) {
                this.timers.save = window.setTimeout(() => { this.save() }, 3000)
                this.timers.mustSave = window.setTimeout(() => { this.save() }, 20000)
                return
            }

            // timer already set; restart save timer
            window.clearTimeout(this.timers.save)
            this.timers.save = window.setTimeout(() => { this.save() }, 3000)
        })
    }
}
