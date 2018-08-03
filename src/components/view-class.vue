<template>
    <div id="view-class">
        <md-table md-card>

            <md-table-toolbar>
                <h1 class="md-title" v-if="cls">{{cls.name}}</h1>

                <md-menu md-align-trigger>
                    <md-button class="md-icon-button" md-menu-trigger>
                        <md-icon>settings</md-icon>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">
                            Open Settings
                        </md-tooltip>
                    </md-button>

                    <md-menu-content>
                        <md-menu-item @click="editClassActive = true">
                            <md-icon>edit</md-icon>
                            <span>Edit Class Name</span>
                        </md-menu-item>

                        <md-menu-item @click="download_csv">
                            <md-icon>cloud_download</md-icon>
                            <span>Export Roster</span>
                        </md-menu-item>

                        <md-menu-item @click="importRosterActive = true">
                            <md-icon>cloud_upload</md-icon>
                            <span>Import Roster</span>
                        </md-menu-item>

                        <md-menu-item
                            @click="resetClassActive = true"
                            :disabled="cls == null || cls.students.length === 0"
                            >
                            <md-icon>settings_backup_restore</md-icon>
                            <span>Reset Class</span>
                        </md-menu-item>

                        <md-menu-item @click="deleteClassActive = true">
                            <md-icon>delete</md-icon>
                            <span>Delete Class</span>
                        </md-menu-item>
                    </md-menu-content>
                </md-menu>
            </md-table-toolbar>

            <md-table-row>
                <md-table-head>Name</md-table-head>
                <md-table-head>Score</md-table-head>
                <md-table-head v-if="db.config.changes && db.config.changes.length > 0">Quick Changes</md-table-head>
                <md-table-head style="text-align: center">Actions</md-table-head>
            </md-table-row>

            <md-table-row v-for="student in students" :key="student.uuid">
                <md-table-cell style="cursor: pointer" @click.native="$router.push({name: 'view-student', params: {class_uuid: cls.uuid, student_uuid: student.uuid}})">
                    <strong>
                        {{student.name}}
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Click to view changes</md-tooltip>
                    </strong>
                </md-table-cell>
                <md-table-cell style="cursor: pointer" @click.native="$router.push({name: 'view-student', params: {class_uuid: cls.uuid, student_uuid: student.uuid}})">
                    <span>
                        {{db.config.base_score + student.total_points()}}
                        <md-tooltip direction="bottom" v-if="mouse_enabled">
                            {{student.changes.length}} change<span v-if="student.changes.length !== 1">s</span>
                        </md-tooltip>
                    </span>
                </md-table-cell>
                <md-table-cell class="change-cell" v-if="db.config.changes && db.config.changes.length > 0">
                    <md-button
                        class="md-primary md-raised"
                        v-for="change in db.config.changes"
                        :key="change.uuid"
                        @click="add_change(class_uuid, student.uuid, change.uuid, change.description, change.points)"
                        :disabled="disabledButtons[student.uuid + change.uuid]">
                        {{change.description}}
                        <md-tooltip direction="bottom" v-if="mouse_enabled">
                            {{change.points}} Point<span v-if="change.points !== 1">s</span>
                        </md-tooltip>
                    </md-button>
                </md-table-cell>
                <md-table-cell style="text-align: center">
                    <md-button class="md-icon-button"
                        :to="{name: 'view-student', params: {class_uuid: cls.uuid, student_uuid: student.uuid}}">
                        <md-icon>remove_red_eye</md-icon>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">View Changes</md-tooltip>
                    </md-button>
                    <md-button class="md-icon-button" @click="editStudent(student.uuid)">
                        <md-icon>edit</md-icon>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Edit Name</md-tooltip>
                    </md-button>
                    <md-button class="md-icon-button" @click="deleteStudent(student.uuid)">
                        <md-icon>delete</md-icon>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Delete Student</md-tooltip>
                    </md-button>
                </md-table-cell>
            </md-table-row>

            <md-table-row class="empty-state" v-show="!students || students.length === 0">
                <md-table-cell colspan=4>
                    <md-empty-state
                        md-icon="person"
                        md-label="Add Student"
                        md-description="You don't have any students yet. Click the add button below to add your first student!"
                        >
                    </md-empty-state>
                </md-table-cell>
            </md-table-row>

        </md-table>

        <md-button class="md-fab md-secondary md-fab-bottom-right" v-if="cls" @click="addStudentActive = true">
            <md-icon>add</md-icon>
            <md-tooltip direction="bottom" v-if="mouse_enabled">Add Student</md-tooltip>
        </md-button>


        <app-edit-class :active.sync="editClassActive" :class_uuid="class_uuid"/>
        <app-import-roster :active.sync="importRosterActive" :class_uuid="class_uuid"/>
        <app-reset-class :active.sync="resetClassActive" :class_uuid="class_uuid"/>
        <app-delete-class :active.sync="deleteClassActive" :class_uuid="class_uuid"/>

        <app-add-student :active.sync="addStudentActive" :class_uuid="class_uuid"/>
        <app-edit-student :active.sync="editStudentActive" :class_uuid="class_uuid" :student_uuid="editStudentUUID"/>
        <app-delete-student :active.sync="deleteStudentActive" :class_uuid="class_uuid" :student_uuid="deleteStudentUUID"/>
    </div>
</template>

<script>
import moment from "moment"
import {mapState, mapMutations} from "vuex"
import download from "../js/download.js"
import AuthorizedMixin from "./authorized-mixin.js"
import AppEditClass from "./dialogs/edit-class.vue"
import AppImportRoster from "./dialogs/import-roster.vue"
import AppResetClass from "./dialogs/reset-class.vue"
import AppDeleteClass from "./dialogs/delete-class.vue"
import AppAddStudent from "./dialogs/add-student.vue"
import AppEditStudent from "./dialogs/edit-student.vue"
import AppDeleteStudent from "./dialogs/delete-student.vue"
export default {
    name: "app-view-class",
    mixins: [AuthorizedMixin],
    components: {AppEditClass, AppImportRoster, AppResetClass, AppDeleteClass, AppAddStudent, AppEditStudent, AppDeleteStudent},
    props: {
        class_uuid: String
    },
    data() {
        return {
            editClassActive: false,
            importRosterActive: false,
            resetClassActive: false,
            deleteClassActive: false,
            addStudentActive: false,
            editStudentActive: false,
            editStudentUUID: null,
            deleteStudentActive: false,
            deleteStudentUUID: null,
            disabledButtons: {}
        }
    },
    computed: {
        ...mapState(["mouse_enabled"]),
        ...mapState("db", ["db"]),
        cls() {
            return this.db.findClass(this.class_uuid)
        },
        students() {
            if (this.cls == null) { return null }
            return this.cls.students
        }
    },
    watch: {
        cls(val) {
            if (val == null) {
                this.$router.push({name: "dashboard"})
            }
        }
    },
    methods: {
        ...mapMutations(["ADD_FEEDBACK"]),
        ...mapMutations("db", ["ADD_STUDENT_CHANGE"]),
        editStudent(uuid) {
            this.editStudentActive = true
            this.editStudentUUID = uuid
        },
        deleteStudent(uuid) {
            this.deleteStudentActive = true
            this.deleteStudentUUID = uuid
        },
        add_change(class_uuid, student_uuid, change_uuid, description, points) {
            this.disabledButtons[student_uuid + change_uuid] = true
            window.setTimeout(() => {
                this.$delete(this.disabledButtons, student_uuid + change_uuid)
            }, 1000)
            this.ADD_STUDENT_CHANGE({class_uuid, student_uuid, description, points})
            this.ADD_FEEDBACK("Change added")
        },
        download_csv() {
            const url = this.cls.csvURL(this.db.config.base_score)
            download(url, "roster-" + this.cls.name + "-" + moment().toISOString(true) + ".csv")
        }
    }
}
</script>

<style lang="stylus" scoped>
#content
    > #view-class
        max-width: inherit

        @media (max-width: 1280px)
            .md-card
                margin: 0px

        .empty-state:hover .md-table-cell
            background-color: inherit

        @media (max-width: 960px)
            .change-cell
                text-align: center
</style>
