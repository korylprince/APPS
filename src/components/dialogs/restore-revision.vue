<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title>Restore Revision?</md-dialog-title>

        <md-dialog-content>
            <p>Restoring a revision will completely overwrite your current data. You should download a backup before restoring in case something goes wrong. Proceed with caution.</p>
            <div v-if="revision_db">
                <span class="md-subheading">Preview:</span>
                <div style="margin-left: 20px">
                    <div v-for="cls in revision_db.classes" :key="cls.uuid">
                        <div>{{cls.name}}:
                            {{cls.students.length}} Student<span v-if="cls.students.length !== 1">s</span></div>
                    </div>
                    <div v-if="revision_db == null || revision_db.classes.length === 0">
                        No classes found
                    </div>
                </div>
            </div>
            <p>Are you sure you want to restore the revision from <strong>{{prettyDate}}</strong>?</p>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-primary" @click="back">Cancel</md-button>
            <md-button class="md-accent" @click="restore(revision_id)" :disabled="is_loading || revision_id == null">
                <span v-show="!is_loading">Overwrite</span>
                <md-progress-spinner
                    class="app-spinner"
                    v-if="is_loading"
                    md-mode="indeterminate"
                    :md-diameter="20"
                    :md-stroke="2"
                    ></md-progress-spinner>
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import moment from "moment"
import {mapState, mapGetters, mapMutations, mapActions} from "vuex"
import google from "../../js/google.js"
export default {
    name: "app-restore-revision",
    props: {
        active: Boolean,
        revision_id: String
    },
    data() {
        return {
            revision_db: null
        }
    },
    computed: {
        ...mapGetters(["is_loading"]),
        ...mapState("db", ["revisions"]),
        revision() {
            if (this.revisions == null) { return null }
            return this.revisions[this.revisions.findIndex(rev => rev.id === this.revision_id)]
        },
        prettyDate() {
            if (this.revision == null) { return null }
            return moment(this.revision.modifiedTime).format("LLLL")
        }
    },
    watch: {
        async active(val) {
            if (val) {
                this.revision_db = null
                try {
                    this.revision_db = await google.read_db_revision(this.revision_id)
                    this.revision_db.sort()
                } catch (err) {
                    this.back()
                    this.UPDATE_ERROR(err.toString())
                }
            }
        }
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR"]),
        ...mapActions("db", ["restore_revision"]),
        back() {
            this.$emit("update:active", false)
        },
        async restore(revision_id) {
            if (revision_id == null) { return }
            await this.restore_revision(revision_id)
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
.md-dialog
    max-width: 600px
</style>
