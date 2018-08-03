<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title>
            Edit Student
            <div class="md-subheading" v-if="cls">Class: {{cls.name}}</div>
        </md-dialog-title>

        <md-dialog-content>
            <md-field :class="{'md-invalid': errors.has('name')}">
                <label>Name</label>
                <md-input ref="name" v-model="name" name="name" data-vv-name="name" v-validate="'required'" @keydown.enter="save(class_uuid, student_uuid, name)"></md-input>
                <span class="md-error">{{errors.first('name')}}</span>
            </md-field>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="back">Cancel</md-button>
            <md-button class="md-primary"
                @click="save(class_uuid, student_uuid, name)"
                :disabled="errors.any() || name == ''"
                >
                Save
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import {mapState, mapMutations} from "vuex"
export default {
    name: "app-edit-student",
    props: {
        active: Boolean,
        class_uuid: String,
        student_uuid: String
    },
    data() {
        return {
            name: ""
        }
    },
    computed: {
        ...mapState("db", ["db"]),
        cls() {
            return this.db.findClass(this.class_uuid)
        },
        student() {
            if (this.cls == null) {
                return null
            }
            return this.cls.findStudent(this.student_uuid)
        }
    },
    watch: {
        active(val) {
            if (val) {
                if (this.student) {
                    this.name = this.student.name
                }
                this.focus()
            }
        }
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK"]),
        ...mapMutations("db", ["MODIFY_STUDENT"]),
        focus() {
            window.setTimeout(() => {
                if (this.$refs.name) {
                    this.$refs.name.$el.focus()
                }
            }, 200)
        },
        back() {
            this.$emit("update:active", false)
        },
        async save(class_uuid, student_uuid, name) {
            try {
                await this.$validator.validateAll()
            } catch (err) {
                this.UPDATE_ERROR("Form validation error")
                console.error("Form validation error:", err)
                return
            }

            this.MODIFY_STUDENT({class_uuid, student_uuid, name})
            this.ADD_FEEDBACK("Student saved")
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
</style>
