<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title>Restore Backup?</md-dialog-title>

        <md-dialog-content>
            <p>Restoring a backup file will completely overwrite your current data. You should download a backup before restoring in case something goes wrong. Proceed with caution.</p>
            <md-field>
                <label>Select backup file</label>
                <md-file @md-change="fileList = $event" />
            </md-field>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-primary" @click="back">Cancel</md-button>
            <md-button class="md-accent" @click="restore(file)" :disabled="is_loading || file == null">
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
import {mapGetters, mapActions} from "vuex"
export default {
    name: "app-restore-file",
    props: {
        active: Boolean
    },
    data() {
        return {
            fileList: null
        }
    },
    computed: {
        ...mapGetters(["is_loading"]),
        file() {
            if (this.fileList != null && this.fileList.length === 1) {
                return this.fileList[0]
            }
            return null
        },
    },
    watch: {
        active(val) {
            if (val) {
                this.fileList = null
            }
        }
    },
    methods: {
        ...mapActions("db", ["restore_file"]),
        back() {
            this.$emit("update:active", false)
        },
        async restore(file) {
            if (file == null) { return }
            await this.restore_file(file)
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
.md-dialog
    max-width: 600px
</style>
