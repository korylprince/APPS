<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title v-if="config_change">Edit Quick Change</md-dialog-title>
        <md-dialog-title v-if="!config_change">
            Edit Change
            <div class="md-subheading" v-if="student">{{cls.name}}: {{student.name}}</div>
            <div class="md-subheading">
                Last Modified:
                <span>{{prettyDateFrom}}
                    <md-tooltip md-direction="bottom">{{prettyDate}}</md-tooltip>
                </span>
            </div>
        </md-dialog-title>

        <md-dialog-content @keydown.native.enter="save(class_uuid, student_uuid, change_uuid, description, points)">
            <md-field :class="{'md-invalid': errors.has('description')}">
                <label>Description</label>
                <md-input ref="description" v-model="description" name="description" data-vv-name="description" v-validate="'required'"></md-input>
                <span class="md-error">{{errors.first('description')}}</span>
            </md-field>

            <md-field :class="{'md-invalid': errors.has('points')}">
                <label>Points</label>
                <md-input type="number" v-model.number="points" name="points" data-vv-name="points" v-validate="'required'"></md-input>
                <span class="md-error">{{errors.first('points')}}</span>
            </md-field>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="back">Cancel</md-button>
            <md-button class="md-primary"
                @click="save(class_uuid, student_uuid, change_uuid, description, points)"
                :disabled="errors.any() || description == '' || points == null"
                >
                Save
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import moment from "moment"
import {mapState, mapMutations} from "vuex"
export default {
    name: "app-edit-change",
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
    data() {
        return {
            description: "",
            points: null
        }
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
    watch: {
        active(val) {
            if (val) {
                if (this.change) {
                    this.description = this.change.description
                    this.points = this.change.points
                }
                this.focus()
            }
        }
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK"]),
        ...mapMutations("db", ["MODIFY_CONFIG_CHANGE", "MODIFY_STUDENT_CHANGE"]),
        focus() {
            window.setTimeout(() => {
                if (this.$refs.description) {
                    this.$refs.description.$el.focus()
                }
            }, 200)
        },
        back() {
            this.$emit("update:active", false)
        },
        async save(class_uuid, student_uuid, change_uuid, description, points) {
            try {
                await this.$validator.validateAll()
            } catch (err) {
                this.UPDATE_ERROR("Form validation error")
                console.error("Form validation error:", err)
                return
            }

            if (this.config_change) {
                this.MODIFY_CONFIG_CHANGE({uuid: change_uuid, description, points})
                this.ADD_FEEDBACK("Quick change saved")
            } else {
                this.MODIFY_STUDENT_CHANGE({class_uuid, student_uuid, change_uuid, description, points})
                this.ADD_FEEDBACK("Change saved")
            }
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
</style>
