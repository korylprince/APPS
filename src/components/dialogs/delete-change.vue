<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title v-if="config_change">Delete Quick Change?</md-dialog-title>
        <md-dialog-title v-if="!config_change">
            Delete Change?
            <div class="md-subheading" v-if="student">{{cls.name}}: {{student.name}}</div>
            <div class="md-subheading">
                Last Modified:
                <span>{{prettyDateFrom}}
                    <md-tooltip md-direction="bottom">{{prettyDate}}</md-tooltip>
                </span>
            </div>
        </md-dialog-title>

        <md-dialog-content v-if="change">
            <p>Are you sure you want to delete the change <strong>{{change.description}}</strong> worth <strong>{{change.points}} points</strong>?
                <br />This action can't be undone.
            </p>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="back">Cancel</md-button>
            <md-button class="md-primary"
                @click="delete_change(class_uuid, student_uuid, change_uuid)"
                >
                Delete
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import moment from "moment"
import {mapState, mapMutations} from "vuex"
export default {
    name: "app-delete-change",
    props: {
        active: Boolean,
        config_change: {
            type: Boolean,
            default: false
        },
        class_uuid: String,
        student_uuid: String,
        change_uuid: String
    },
    computed: {
        ...mapState("db", ["db"]),
        cls() {
            if (this.config_change) {
                return null
            }
            return this.db.findClass(this.class_uuid)
        },
        student() {
            if (this.cls == null) {
                return null
            }
            return this.cls.findStudent(this.student_uuid)
        },
        change() {
            if (this.config_change) {
                return this.db.config.findChange(this.change_uuid)
            }

            if (this.student == null) { return null }
            return this.student.findChange(this.change_uuid)
        },
        prettyDate() {
            if (this.change == null) { return null }
            return moment(this.change.date).format("LLLL")
        },
        prettyDateFrom() {
            if (this.change == null) { return null }
            return moment(this.change.date).fromNow()
        }
    },
    methods: {
        ...mapMutations(["ADD_FEEDBACK"]),
        ...mapMutations("db", ["REMOVE_CONFIG_CHANGE", "REMOVE_STUDENT_CHANGE"]),
        back() {
            this.$emit("update:active", false)
        },
        delete_change(class_uuid, student_uuid, change_uuid) {
            if (this.config_change) {
                this.REMOVE_CONFIG_CHANGE(change_uuid)
                this.ADD_FEEDBACK("Quick change deleted")
            } else {
                this.REMOVE_STUDENT_CHANGE({class_uuid, student_uuid, change_uuid})
                this.ADD_FEEDBACK("Change deleted")
            }
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
</style>
