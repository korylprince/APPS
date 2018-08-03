<template>
    <div id="view-student">
        <md-table md-card>

            <md-table-toolbar>
                <div class="md-title" v-if="student">
                    {{student.name}}
                    <div class="md-subheading">Score: {{db.config.base_score + student.total_points()}}</div>
                </div>

                <md-menu md-align-trigger>
                    <md-button class="md-icon-button" md-menu-trigger>
                        <md-icon>settings</md-icon>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">
                            Open Settings
                        </md-tooltip>
                    </md-button>

                    <md-menu-content>
                        <md-menu-item @click="editStudentActive = true">
                            <md-icon>edit</md-icon>
                            <span>Edit Student Name</span>
                        </md-menu-item>

                        <md-menu-item @click="resetStudentActive = true" :disabled="student.changes.length === 0">
                            <md-icon>settings_backup_restore</md-icon>
                            <span>Reset Student</span>
                        </md-menu-item>

                        <md-menu-item @click="deleteStudentActive = true">
                            <md-icon>delete</md-icon>
                            <span>Delete Student</span>
                        </md-menu-item>
                    </md-menu-content>
                </md-menu>
            </md-table-toolbar>

            <md-table-row>
                <md-table-head>Description</md-table-head>
                <md-table-head>Points</md-table-head>
                <md-table-head>Last Modified</md-table-head>
                <md-table-head style="text-align: center">Actions</md-table-head>
            </md-table-row>

            <md-table-row v-for="change in changes" :key="change.uuid">
                <md-table-cell>{{change.description}}</md-table-cell>
                <md-table-cell>{{change.points}}</md-table-cell>
                <md-table-cell>
                    <span>
                        {{change.date | prettyDateFrom}}
                        <md-tooltip direction="bottom">{{change.date | prettyDate}}</md-tooltip>
                    </span>
                </md-table-cell>
                <md-table-cell style="text-align: center">
                    <md-button class="md-icon-button" @click="editChange(change.uuid)">
                        <md-icon>edit</md-icon>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Edit Change</md-tooltip>
                    </md-button>
                    <md-button class="md-icon-button" @click="deleteChange(change.uuid)">
                        <md-icon>delete</md-icon>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Delete Change</md-tooltip>
                    </md-button>
                </md-table-cell>
            </md-table-row>

            <md-table-row class="empty-state" v-show="!changes || changes.length === 0">
                <md-table-cell colspan=4>
                    <md-empty-state
                        md-icon="assignment"
                        md-label="Add Change"
                        md-description="This student doesn't have any changes yet. Click the add button below to add a change!"
                        >
                    </md-empty-state>
                </md-table-cell>
            </md-table-row>


        </md-table>

        <md-button class="md-fab md-secondary md-fab-bottom-right" @click="addChangeActive = true">
            <md-icon>add</md-icon>
            <md-tooltip direction="bottom" v-if="mouse_enabled">Add Change</md-tooltip>
        </md-button>

        <app-edit-student :active.sync="editStudentActive" :class_uuid="class_uuid" :student_uuid="student_uuid"/>
        <app-reset-student :active.sync="resetStudentActive" :class_uuid="class_uuid" :student_uuid="student_uuid"/>
        <app-delete-student :active.sync="deleteStudentActive" :class_uuid="class_uuid" :student_uuid="student_uuid"/>

        <app-add-change :active.sync="addChangeActive" :class_uuid="class_uuid" :student_uuid="student_uuid"/>
        <app-edit-change :active.sync="editChangeActive" :class_uuid="class_uuid" :student_uuid="student_uuid" :change_uuid="editChangeUUID"/>
        <app-delete-change :active.sync="deleteChangeActive" :class_uuid="class_uuid" :student_uuid="student_uuid" :change_uuid="deleteChangeUUID"/>
    </div>
</template>

<script>
import moment from "moment"
import {mapState} from "vuex"
import AuthorizedMixin from "./authorized-mixin.js"
import AppEditStudent from "./dialogs/edit-student.vue"
import AppResetStudent from "./dialogs/reset-student.vue"
import AppDeleteStudent from "./dialogs/delete-student.vue"
import AppAddChange from "./dialogs/add-change.vue"
import AppEditChange from "./dialogs/edit-change.vue"
import AppDeleteChange from "./dialogs/delete-change.vue"
export default {
    name: "app-view-class",
    mixins: [AuthorizedMixin],
    components: {AppEditStudent, AppResetStudent, AppDeleteStudent, AppAddChange, AppEditChange, AppDeleteChange},
    props: {
        class_uuid: String,
        student_uuid: String
    },
    data() {
        return {
            editStudentActive: false,
            resetStudentActive: false,
            deleteStudentActive: false,
            addChangeActive: false,
            editChangeActive: false,
            editChangeUUID: null,
            deleteChangeActive: false,
            deleteChangeUUID: null
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
        ...mapState(["mouse_enabled"]),
        ...mapState("db", ["db"]),
        cls() {
            return this.db.findClass(this.class_uuid)
        },
        student() {
            if (this.cls == null) {
                return null
            }
            return this.cls.findStudent(this.student_uuid)
        },
        changes() {
            if (this.student == null) { return null }
            return this.student.changes
        }
    },
    watch: {
        student(val) {
            if (val == null) {
                this.$router.push({name: "view-class", params: {class_uuid: this.class_uuid}})
            }
        }
    },
    methods: {
        editChange(uuid) {
            this.editChangeActive = true
            this.editChangeUUID = uuid
        },
        deleteChange(uuid) {
            this.deleteChangeActive = true
            this.deleteChangeUUID = uuid
        }
    }
}
</script>

<style lang="stylus" scoped>
#content
    > #view-student
        max-width: inherit

        @media (max-width: 1280px)
            .md-card
                margin: 0px

        .empty-state:hover .md-table-cell
            background-color: inherit

        .md-empty-state-label
            white-space: pre
</style>
