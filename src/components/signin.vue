<template>
    <md-card>
        <md-card-header>
            <div class="md-title" style="text-align: center">Sign In</div>
        </md-card-header>

        <md-card-content>
            <div style="text-align: center">
                <p class="md-body-1">APPS uses Google Drive to store its configuration and data. Click the button below to authorize APPS to store data in Google Drive.</p>
                <md-button class="md-raised google" :disabled="is_loading" @click="do_signin">
                    <img src="img/google.svg" v-if="!is_loading">
                    <span v-show="!is_loading">Sign In With Google</span>
                    <md-progress-spinner
                        class="app-spinner"
                        v-if="is_loading"
                        md-mode="indeterminate"
                        :md-diameter="20"
                        :md-stroke="2"
                        ></md-progress-spinner>
                </md-button>
            </div>
        </md-card-content>
    </md-card>
</template>

<script>
import {mapGetters, mapActions} from "vuex"
import store from "../js/store.js"
export default {
    name: "app-signin",
    computed: {
        ...mapGetters(["is_loading"])
    },
    methods: {
        ...mapActions(["signin"]),
        do_signin() {
            this.signin()
        }
    },
    beforeRouteEnter(to, from, next) {
        if (store.state.signed_in) {
            next({name: "dashboard"})
            return
        }
        next()
    }
}
</script>

<style lang="stylus">
.md-button.google
    .md-button-content
        display: flex

    img
        height: 24px
        margin-right: 5px

    span
        align-self: center
</style>
