<template>
    <div id="root" class="page-container">
        <div id="loader" v-if="app_state === 'loading'">
            <div>
                <div class="md-display-1">Loading APPS...</div>
                <md-progress-spinner class="md-primary" md-mode="indeterminate"></md-progress-spinner>
            </div>
        </div>
        <div id="loader" v-if="app_state === 'error'">
            <div>
                <div class="md-display-1">Unable to load APPS. Please try again later...</div>
            </div>
        </div>
        <md-app>
            <md-app-toolbar class="md-primary md-dense">
                <md-button class="md-icon-button" @click="menuVisible = true" v-if="signed_in && !menuVisible">
                    <md-icon>menu</md-icon>
                </md-button>

                <div id="navigation-breadcrumbs">
                    <!-- APPS link -->
                    <span class="md-title" v-if="!signed_in || $route.name === 'dashboard'">APPS</span>
                    <router-link class="md-title link" :to="{name: 'dashboard'}" v-if="signed_in && $route.name !== 'dashboard'">
                        <span>APPS</span>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Back to Dashboard</md-tooltip>
                    </router-link>

                    <!-- Class link -->
                    <span class="md-title breadcrumb" v-if="cls && !student">&#10132; {{cls.name}}</span>
                    <router-link class="md-title link breadcrumb" v-if="student" :to="{name: 'view-class', params: {class_uuid: cls.uuid}}">
                        &#10132; {{cls.name}}
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Back to {{cls.name}}</md-tooltip>
                    </router-link>

                    <span class="md-title breadcrumb" v-if="student">&#10140; {{student.name}}</span>

                    <!-- Settings link -->
                    <span class="md-title breadcrumb" v-if="$route.name === 'settings'">&#10140; Settings</span>
                    <router-link class="md-title link breadcrumb" v-if="$route.name === 'revisions'" :to="{name: 'settings'}">
                        &#10132; Settings
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Back to Settings</md-tooltip>
                    </router-link>

                    <span class="md-title breadcrumb" v-if="$route.name === 'revisions'">&#10140; Revisions</span>
                </div>

                <div class="spacer"></div>

                <div>
                    <span class="save-status" style="cursor: pointer;"
                        @click="check_save"
                        v-if="signed_in && save_status === 'Unsaved changes...'">
                        <strong>{{save_status}}</strong>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Save now</md-tooltip>
                    </span>

                    <span class="save-status" v-if="signed_in && save_status !== 'Unsaved changes...'">{{save_status}}</span>

                    <span v-show="signed_in">
                        <md-avatar @click.native>
                            <img :src="user_image" alt="Avatar">
                        </md-avatar>
                        <md-tooltip id="name-tooltip" md-direction="bottom">
                            <div><strong>Google Account</strong></div>
                            <div>{{user_name}}</div>
                            <div>{{user_email}}</div>
                        </md-tooltip>
                    </span>
                </div>
            </md-app-toolbar>

            <md-app-drawer :md-active="menuVisible" md-persistent="full">
                <md-toolbar class="md-transparent" md-elevation="0">
                    <span>Navigation</span>

                    <div class="md-toolbar-section-end">
                        <md-button class="md-icon-button md-dense" @click="menuVisible = false">
                            <md-icon>keyboard_arrow_left</md-icon>
                        </md-button>
                    </div>
                </md-toolbar>

                <md-list>
                    <md-list-item :to="{name: 'dashboard'}" @click="menuVisible = false">
                        <md-icon>home</md-icon>
                        <span class="md-list-item-text">Dashboard</span>
                    </md-list-item>

                    <md-list-item>
                        <md-icon>list</md-icon>
                        <span class="md-list-item-text">Classes</span>
                    </md-list-item>

                    <md-list-item v-if="classes" class="md-inset"
                        v-for="cls in classes" :key="cls.uuid"
                        :to="{name: 'view-class', params: {class_uuid: cls.uuid}}"
                        @click="menuVisible = false">
                        <div class="md-list-item-text">
                            <span>{{cls.name}}</span>
                        </div>
                    </md-list-item>

                    <md-divider></md-divider>

                    <md-list-item :to="{name: 'settings'}" @click="menuVisible = false">
                        <md-icon>settings</md-icon>
                        <span class="md-list-item-text">Settings</span>
                    </md-list-item>

                    <md-list-item @click="do_signout">
                        <md-icon>power_settings_new</md-icon>
                        <span class="md-list-item-text">Sign Out</span>
                    </md-list-item>
                </md-list>
            </md-app-drawer>

            <md-app-content id="content" @click.native="menuVisible = false">
                <router-view></router-view>
            </md-app-content>
        </md-app>

        <app-data-inconsistency :active="data_inconsistency"/>

        <md-dialog-alert
            id="dialog-alert"
            :md-active="show_dialog"
            @update:mdActive="UPDATE_ERROR(null)"
            md-title="Error"
            :md-content="error"
            :md-click-outside-to-close="false">
        </md-dialog-alert>

        <md-snackbar
            :md-active="current_feedback != null"
            @update:mdActive="clear_feedback()"
            md-persistent>
            <span>{{current_feedback}}</span>
        </md-snackbar>

        <div id="eol"><a href="https://github.com/korylprince/APPS">APPS will cease to work on March 31st, 2023.</a></div>
    </div>
</template>

<script>
import AppDataInconsistency from "./dialogs/data-inconsistency.vue"
import {mapState, mapGetters, mapMutations, mapActions} from "vuex"
export default {
    name: "my-app",
    components: {AppDataInconsistency},
    data() {
        return {
            menuVisible: false
        }
    },
    computed: {
        ...mapState(["app_state", "mouse_enabled", "signed_in", "user_name", "user_email", "user_image"]),
        ...mapState({"error": "last_error"}),
        ...mapState("db", ["db", "data_inconsistency"]),
        ...mapGetters(["show_dialog", "current_feedback"]),
        ...mapGetters("db", ["dirty", "save_status"]),
        classes() {
            if (this.db == null) { return null }
            return this.db.classes
        },
        class_uuid() {
            return this.$route.params.class_uuid
        },
        cls() {
            if (this.db == null) { return null }
            return this.db.findClass(this.class_uuid)
        },
        student_uuid() {
            return this.$route.params.student_uuid
        },
        student() {
            if (this.cls == null) {
                return null
            }
            return this.cls.findStudent(this.student_uuid)
        },
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR"]),
        ...mapActions(["clear_feedback", "signout"]),
        ...mapActions("db", ["check_save"]),
        do_signout() {
            this.menuVisible = false
            this.signout()
        }
    }
}
</script>

<style lang="stylus" scoped>
#root, &>.md-app
    min-height: 100vh

#name-tooltip
    text-align: right
    line-height: 15px
    padding: 4px

#loader
    display: flex
    position:  absolute
    height: 100%
    width: 100%
    z-index: 99
    text-align: center
    background-color: #fdfdfd

    div
        flex: 1
        align-self: center
        
        .md-progress-spinner
            margin-top: 15px


#dialog-alert
    z-index: 999

.md-toolbar
    .spacer
        flex: 1

    .md-title
        &.link:hover
            text-decoration: none
            font-weight: 500

        &.breadcrumb
            margin-left: 4px

    #navigation-breadcrumbs

        @media (max-width: 600px)
            white-space: nowrap
            overflow-x: scroll
            overflow-y: hidden
            max-width: 50%
        @media (max-width: 480px)
            max-width: 45%
        @media (max-width: 400px)
            max-width: 30%
        @media (max-width: 320px)
            max-width: 25%

    .save-status
        margin-right: 25px

        @media (max-width: 600px)
            margin-right: 5px


#content
    background-color: inherit

    @media (max-width: 1280px)
        padding: 0px

    > div, form
        max-width: 600px
        margin-left: auto
        margin-right: auto

.md-tooltip
    height: inherit

#eol
    position: absolute
    width: 100%
    bottom: 20px
    text-align: center
    font-size: 1.6em
    z-index: 999
    @media (max-width: 600px)
        font-size: 1em
    a
        color: red !important
        text-decoration: underline
</style>
