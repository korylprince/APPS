import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

import google from "./google.js"

import db from "./store_db.js"

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== "production",
    modules: {
        db
    },
    state: {
        app_state: "loading",
        last_error: null,
        _loading_count: 0,
        _next_route: null,
        _feedback: [],
        _feedback_delay: false,
        mouse_enabled: false,
        signed_in: false,
        user_name: null,
        user_email: null,
        user_image: null
    },
    getters: {
        is_loading(state) {
            return state._loading_count !== 0
        },
        next_route(state) {
            if (state._next_route == null) {
                return null
            }
            return {
                name: state._next_route.name,
                path: state._next_route.path,
                params: state._next_route.params,
                query: state._next_route.query
            }
        },
        show_dialog(state) {
            return state.last_error != null
        },
        current_feedback(state) {
            if (state._feedback_delay || state._feedback.length === 0) { return null }
            return state._feedback[0]
        }
    },
    mutations: {
        UPDATE_APP_STATE(state, new_state) {
            state.app_state = new_state
        },
        UPDATE_ERROR(state, error) {
            state.last_error = error
        },
        START_LOADING(state) {
            state._loading_count++
            state.last_error = null
        },
        STOP_LOADING(state) {
            state._loading_count--
        },
        UPDATE_NEXT_ROUTE(state, route) {
            state._next_route = route
        },
        ADD_FEEDBACK(state, msg) {
            if (state._feedback[state._feedback.length - 1] !== msg) {
                state._feedback.push(msg)
            }
        },
        CLEAR_FEEDBACK(state) {
            // remove first element
            state._feedback.splice(0, 1)
            state._feedback_delay = true
        },
        CLEAR_FEEDBACK_DELAY(state) {
            state._feedback_delay = false
        },
        UPDATE_MOUSE_ENABLED(state, status) {
            state.mouse_enabled = status
        },
        UPDATE_SIGNED_IN_STATUS(state, status) {
            state.signed_in = status
        },
        UPDATE_USER(state, {name, email, image_url}) {
            state.user_name = name
            state.user_email = email
            state.user_image = image_url
        }
    },
    actions: {
        clear_feedback(context) {
            context.commit("CLEAR_FEEDBACK")
            window.setTimeout(() => {
                context.commit("CLEAR_FEEDBACK_DELAY")
            }, 500)
        },
        async init(context) {
            context.commit("START_LOADING")
            try {
                var auth = await google.init()
            } catch (err) {
                context.commit("UPDATE_APP_STATE", "error")
                context.commit("UPDATE_ERROR", "An error occurred starting application: " + err)
                context.commit("STOP_LOADING")
                return
            }

            context.commit("STOP_LOADING")

            context.commit("UPDATE_SIGNED_IN_STATUS", auth.signin_status)
            context.commit("UPDATE_USER", {name: auth.user.name, email: auth.user.email, image_url: auth.user.image_url})

            google.attach_handlers(async status => {
                if (status) {
                    await context.dispatch("db/init")
                }
                context.commit("UPDATE_SIGNED_IN_STATUS", status)
            }, user => {
                if (!user || !(user.getBasicProfile())) {
                    context.commit("UPDATE_USER", {name: null, email: null, image_url: null})
                }
                var name = user.getBasicProfile().getName()
                var email = user.getBasicProfile().getEmail()
                var image_url = user.getBasicProfile().getImageUrl()
                context.commit("UPDATE_USER", {name, email, image_url})
            })

            if (auth.signin_status) {
                await context.dispatch("db/init")
            }

            context.commit("UPDATE_APP_STATE", "started")
        },
        async signin(context) {
            context.commit("START_LOADING")
            try {
                await google.signin()
            } catch (err) {
                context.commit("UPDATE_ERROR", "An error occurred when trying to sign in.")
                console.error("Error signing in:", err)
            }
            context.commit("STOP_LOADING")
        },
        async signout(context) {
            context.commit("START_LOADING")
            try {
                await google.signout()
            } catch (err) {
                context.commit("UPDATE_ERROR", "An error occurred when trying to sign out.")
                console.error("Error signing out:", err)
            }
            context.commit("STOP_LOADING")
        }
    }
})

store.dispatch("init")

export default store
