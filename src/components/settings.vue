<template>
    <div id="settings">
        <md-card>
            <md-card-header>
                <div class="md-title">Edit Settings</div>
            </md-card-header>

            <md-card-content>
                <p>
                    <strong>Base Score</strong> is the score every student will start at before any changes are added.
                </p>
                <md-field :class="{'md-invalid': errors.has('base score')}">
                    <label>Base Score</label>
                    <md-input type="number" v-model.number="base_score" name="base_score" data-vv-name="base score" v-validate="'required'" @keydown.enter="save_base(base_score)"></md-input>
                    <span class="md-error">{{errors.first('base score')}}</span>
                </md-field>
            </md-card-content>

            <md-card-actions>
                <md-button class="md-primary" @click="save_base(base_score)">
                    Save
                </md-button>
            </md-card-actions>
        </md-card>

        <md-card style="margin-top: 25px">
            <md-card-header>
                <div class="md-title">Quick Changes</div>
            </md-card-header>

            <md-card-content>
                <p>
                    <strong>Quick Changes</strong> are changes that you can quickly add while viewing a class.
                </p>
                <md-table>

                    <md-table-row>
                        <md-table-head>Description</md-table-head>
                        <md-table-head>Points</md-table-head>
                        <md-table-head style="text-align: center">Actions</md-table-head>
                    </md-table-row>

                    <md-table-row v-for="change in db.config.changes" :key="change.uuid">
                        <md-table-cell>{{change.description}}</md-table-cell>
                        <md-table-cell>{{change.points}}</md-table-cell>

                        <md-table-cell style="text-align: center">
                            <md-button class="md-icon-button" @click="editChange(change.uuid)">
                                <md-icon>edit</md-icon>
                                <md-tooltip md-direction="bottom" v-if="mouse_enabled">Edit</md-tooltip>
                            </md-button>

                            <md-button class="md-icon-button" @click="deleteChange(change.uuid)">
                                <md-icon>delete</md-icon>
                                <md-tooltip md-direction="bottom" v-if="mouse_enabled">Delete</md-tooltip>
                            </md-button>
                        </md-table-cell>
                    </md-table-row>
                </md-table>
            </md-card-content>

            <md-card-actions>
                <md-button class="md-accent" @click="resetChangeActive = true">
                    Reset
                </md-button>
                <md-button class="md-primary" @click="addChangeActive = true">
                    Add
                </md-button>
            </md-card-actions>
        </md-card>

        <md-card style="margin-top: 25px">
            <md-card-header>
                <div class="md-title">Advanced</div>
            </md-card-header>

            <md-card-area md-inset>
                <md-card-content>
                    <span class="md-subheading" style="font-size: 1.2rem">Export</span>
                    <p>Use the <strong>Download Backup</strong> button to download a full backup of your data. Use the <strong>Export Roster</strong> button to export a CSV file with score data for easy manipulation or import into other programs.</p>
                    <md-button class="md-raised md-primary" @click="download_backup">Download Backup</md-button>
                    <md-button class="md-raised md-primary" @click="download_csv">Export Roster</md-button>
                </md-card-content>
            </md-card-area>

            <md-card-area md-inset>
                <md-card-content>
                    <span class="md-subheading" style="font-size: 1.2rem">Import</span>
                    <p>Use the <strong>Restore Backup</strong> button to restore a backup file you've previously downloaded. Use the <strong>Import Class List</strong> button to quickly create all of your classes. Note: You can also import lists of students from a class' settings menu.</p>
                    <md-button class="md-raised md-primary" @click="restoreActive = true">Restore Backup</md-button>
                    <md-button class="md-raised md-primary" @click="importActive = true">Import Class List</md-button>
                </md-card-content>
            </md-card-area>

            <md-card-area md-inset>
                <md-card-content>
                    <span class="md-subheading" style="font-size: 1.2rem">Revisions</span>
                    <p>Google Drive stores several revisions of your data. If you make a mistake or want to look at historical data, use the <strong>View Revisions</strong> button to view, download, or restore a previous revision of your data</p>
                    <md-button class="md-raised md-primary" :to="{name: 'revisions'}">View Revisions</md-button>
                </md-card-content>
            </md-card-area>

            <md-card-area md-inset>
                <md-card-content>
                    <span class="md-subheading" style="font-size: 1.2rem">Reset</span>
                    <p>Use the <strong>Reset</strong> button to reset certain parts of your data. Use this option to clear grades for another grading period or clear classes for another semester. You can clear all changes, students, or classes. Note: You can reset a class from its settings menu.</p>
                    <md-button class="md-raised md-primary" @click="resetActive = true">Reset</md-button>
                </md-card-content>
            </md-card-area>
        </md-card>

        <app-add-change :active.sync="addChangeActive" :config_change="true"/>
        <app-reset-quick-changes :active.sync="resetChangeActive"/>
        <app-edit-change :active.sync="editChangeActive" :config_change="true" :change_uuid="editChangeUUID"/>
        <app-delete-change :active.sync="deleteChangeActive" :config_change="true" :change_uuid="deleteChangeUUID"/>
        <app-import-classes :active.sync="importActive"/>
        <app-restore-file :active.sync="restoreActive"/>
        <app-reset-data :active.sync="resetActive"/>
    </div>
</template>

<script>
import moment from "moment"
import {mapState, mapMutations} from "vuex"
import download from "../js/download.js"
import AuthorizedMixin from "./authorized-mixin.js"
import AppEditChange from "./dialogs/edit-change.vue"
import AppResetQuickChanges from "./dialogs/reset-quick-changes.vue"
import AppDeleteChange from "./dialogs/delete-change.vue"
import AppAddChange from "./dialogs/add-change.vue"
import AppImportClasses from "./dialogs/import-classes.vue"
import AppRestoreFile from "./dialogs/restore-file.vue"
import AppResetData from "./dialogs/reset-data.vue"
export default {
    name: "app-settings",
    mixins: [AuthorizedMixin],
    components: {AppEditChange, AppResetQuickChanges, AppDeleteChange, AppAddChange, AppImportClasses, AppRestoreFile, AppResetData},
    data() {
        return {
            base_score: null,
            addChangeActive: false,
            resetChangeActive: false,
            editChangeActive: false,
            editChangeUUID: null,
            deleteChangeActive: false,
            deleteChangeUUID: null,
            importActive: false,
            restoreActive: false,
            resetActive: false
        }
    },
    computed: {
        ...mapState(["mouse_enabled"]),
        ...mapState("db", ["db"])
    },
    watch: {
        // update base_score when database is restored
        "db.config.base_score": function(base_score) {
            this.base_score = base_score
        }
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK"]),
        ...mapMutations("db", ["UPDATE_BASE_SCORE"]),
        async save_base(base_score) {
            try {
                await this.$validator.validateAll()
            } catch (err) {
                this.UPDATE_ERROR("Form validation error")
                console.error("Form validation error:", err)
                return
            }

            this.UPDATE_BASE_SCORE(base_score)
            this.ADD_FEEDBACK("Base Score saved")
        },
        editChange(uuid) {
            this.editChangeActive = true
            this.editChangeUUID = uuid
        },
        deleteChange(uuid) {
            this.deleteChangeActive = true
            this.deleteChangeUUID = uuid
        },
        download_backup() {
            const url = this.db.jsonURL()
            download(url, "backup-" + moment().toISOString(true) + ".json")
        },
        download_csv() {
            const url = this.db.csvURL()
            download(url, "roster-" + moment().toISOString(true) + ".csv")
        }
    },
    created() {
        this.base_score = this.db.config.base_score
    }
}
</script>

<style lang="stylus" scoped>
#settings
    @media (max-width: 1280px)
        padding-top: 16px
</style>
