<template>
    <md-dialog :md-active="active">
        <md-dialog-title>Data Inconsistency</md-dialog-title>

        <md-dialog-content>
            <p>Your data was not saved because another <strong>APPS</strong> session on another device or browser tab made other changes first.</p>
            <p><strong>Don't Panic! Nothing has been lost.</strong> You need to choose which data to keep.</p>
            <p>Use the <strong>Save Anyway</strong> button to save your data in this session, losing the changes made in the other session.</p>
            <p>Use the <strong>Reload</strong> button to load the changes from the other session, losing the unsaved changes in this session.</p>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="save_anyway" :disabled="is_loading || button_clicked != null">
                <span v-show="!is_loading || button_clicked !== 'save'">Save Anyway</span>
                <md-progress-spinner
                    class="app-spinner"
                    v-if="is_loading && button_clicked === 'save'"
                    md-mode="indeterminate"
                    :md-diameter="20"
                    :md-stroke="2"
                    ></md-progress-spinner>
            </md-button>

            <md-button class="md-primary" @click="reload" :disabled="is_loading || button_clicked != null">
                <span v-show="!is_loading || button_clicked !== 'reload'">Reload</span>
                <md-progress-spinner
                    class="app-spinner"
                    v-if="is_loading && button_clicked === 'reload'"
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
import {mapGetters, mapActions} from "vuex"
export default {
    name: "app-data-inconsistency",
    props: {
        active: Boolean
    },
    data() {
        return {
            button_clicked: null
        }
    },
    computed: {
        ...mapGetters(["is_loading"]),
    },
    methods: {
        ...mapActions("db", ["init", "save"]),
        async save_anyway() {
            this.button_clicked = "save"
            await this.save()
            this.button_clicked = null
        },
        async reload() {
            this.button_clicked = "reload"
            await this.init()
            this.$router.push({name: "dashboard"})
            this.button_clicked = null
        }
    }
}
</script>

<style lang="stylus" scoped>
.md-dialog
    max-width: 600px
</style>
