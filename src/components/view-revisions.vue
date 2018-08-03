<template>
    <div id="view-revisions">
        <div v-show="!revisions || revisions.length === 0">
            <md-empty-state
                md-icon="list"
                md-label="No Revisions Found"
                md-description="Revisions are automatically created when your data is saved. Check back later after your data has been saved."
                >
            </md-empty-state>
        </div>

        <md-table v-if="revisions && revisions.length > 0" md-card>

            <md-table-toolbar>
                <div class="md-title">
                    Revisions
                </div>
                <p style="margin-left: 10px">Revisions are managed automatically by Google Drive and only the most recent versions of your data are saved.</p>
            </md-table-toolbar>

            <md-table-row>
                <md-table-head>Date</md-table-head>
                <md-table-head style="text-align: center">Actions</md-table-head>
            </md-table-row>

            <md-table-row v-for="revision in revisions" :key="revision.id">
                <md-table-cell>
                    <span>
                        {{revision.modifiedTime | prettyDateFrom}}
                        <md-tooltip direction="bottom">{{revision.modifiedTime | prettyDate}}</md-tooltip>
                    </span>
                </md-table-cell>
                <md-table-cell style="text-align: center">

                    <md-button class="md-icon-button" @click="restore(revision.id)" :disabled="is_loading">
                        <md-icon>restore</md-icon>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Preview and restore revision</md-tooltip>
                    </md-button>

                    <md-button class="md-icon-button"
                        @click="download_revision(revision.id, revision.modifiedTime)"
                        :disabled="is_loading"
                        >
                        <md-icon>cloud_download</md-icon>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Download revision backup</md-tooltip>
                    </md-button>

                </md-table-cell>
            </md-table-row>
        </md-table>

        <app-restore-revision :active.sync="restoreActive" :revision_id="restoreID"/>

    </div>
</template>

<script>
import moment from "moment"
import {mapState, mapMutations} from "vuex"
import download from "../js/download.js"
import google from "../js/google.js"
import store from "../js/store.js"
import AuthorizedMixin from "./authorized-mixin.js"
import AppRestoreRevision from "./dialogs/restore-revision.vue"
export default {
    name: "app-view-revisions",
    mixins: [AuthorizedMixin],
    components: {AppRestoreRevision},
    data() {
        return {
            restoreActive: false,
            restoreID: null
        }
    },
    filters: {
        prettyDate(d) {
            if (d == null) { return null }
            return moment(d).format("LLLL")
        },
        prettyDateFrom(d) {
            if (d == null) { return null }
            return moment(d).fromNow()
        }
    },
    computed: {
        ...mapState(["is_loading", "mouse_enabled"]),
        ...mapState("db", ["revisions"])
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR"]),
        restore(id) {
            this.restoreActive = true
            this.restoreID = id
        },
        async download_revision(id, time) {
            try {
                var db = await google.read_db_revision(id)
            } catch (err) {
                this.UPDATE_ERROR(err.toString())
                return
            }

            const url = db.jsonURL()
            download(url, "revision-" + moment(time).toISOString(true) + ".json")
        }
    },
    async beforeCreate() {
        await store.dispatch("db/list_revisions")
    }
}
</script>

<style lang="stylus">
</style>
