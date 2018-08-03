<template>
    <div id="dashboard" class="md-layout md-gutter">
        <div v-show="!(db.classes) || db.classes.length === 0" style="margin: auto">
            <md-empty-state
                md-icon="class"
                md-label="Add Class"
                md-description="You don't have any classes yet. Click the add button below to add your first class!"
                >
            </md-empty-state>
        </div>

        <md-card
            class="md-layout-item md-size-25 md-medium-size-45 md-small-size-100"
            :class="{mouse_enabled: mouse_enabled}"
            :md-with-hover="mouse_enabled"
            v-for="cls in db.classes"
            :key="cls.uuid"
            v-show="db.classes && db.classes.length > 0">

            <md-ripple @click.native="$router.push({name: 'view-class', params: {class_uuid: cls.uuid}})">
                <md-card-header>
                    <div class="md-title class-name">{{cls.name}}</div>
                    <div class="md-subhead">
                        {{cls.students.length}} Student<span v-if="cls.students.length !== 1">s</span>
                    </div>
                </md-card-header>

                <md-card-content>
                </md-card-content>

                <md-card-actions>
                    <md-button class="md-icon-button" @click.native.stop="editClass(cls.uuid)">
                        <md-icon>edit</md-icon>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Edit Name</md-tooltip>
                    </md-button>
                    <md-button class="md-icon-button" @click.native.stop="deleteClass(cls.uuid)">
                        <md-icon>delete</md-icon>
                        <md-tooltip direction="bottom" v-if="mouse_enabled">Delete Class</md-tooltip>
                    </md-button>
                </md-card-actions>
            </md-ripple>
        </md-card>

        <md-button class="md-fab md-secondary md-fab-bottom-right" @click="addActive = true">
            <md-icon>add</md-icon>
            <md-tooltip direction="bottom" v-if="mouse_enabled">Add Class</md-tooltip>
        </md-button>

        <app-add-class :active.sync="addActive"/>
        <app-edit-class :active.sync="editActive" :class_uuid="editUUID"/>
        <app-delete-class :active.sync="deleteActive" :class_uuid="deleteUUID"/>
    </div>
</template>

<script>
import {mapState} from "vuex"
import AuthorizedMixin from "./authorized-mixin.js"
import AppAddClass from "./dialogs/add-class.vue"
import AppEditClass from "./dialogs/edit-class.vue"
import AppDeleteClass from "./dialogs/delete-class.vue"
export default {
    name: "app-dashboard",
    mixins: [AuthorizedMixin],
    components: {AppAddClass, AppEditClass, AppDeleteClass},
    data() {
        return {
            addActive: false,
            editActive: false,
            editUUID: null,
            deleteActive: false,
            deleteUUID: null
        }
    },
    computed: {
        ...mapState(["mouse_enabled"]),
        ...mapState("db", ["db"]),
    },
    methods: {
        editClass(uuid) {
            this.editActive = true
            this.editUUID = uuid
        },
        deleteClass(uuid) {
            this.deleteActive = true
            this.deleteUUID = uuid
        }
    }
}
</script>

<style lang="stylus">
#content
    > #dashboard
        max-width: inherit
        
        .md-card
            margin-top: 8px
            margin-bottom: 8px
            padding: 0

            .class-name
                overflow: hidden
                white-space: nowrap
                text-overflow: ellipsis

            &.mouse_enabled .md-card-actions
               opacity: 0

            &:hover
                .md-card-actions
                    opacity: 1.0
</style>
