<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title>Reset Student?</md-dialog-title>

        <md-dialog-content v-if="student">
            <p>Are you sure you want to clear all <strong>changes</strong> from <strong>{{student.name}}</strong>?
                <br />This action can't be undone.
            </p>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="back">Cancel</md-button>
            <md-button class="md-primary"
                @click="reset(class_uuid, student_uuid)"
                >
                Reset
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import {mapState, mapMutations} from "vuex"
export default {
    name: "app-reset-class",
    props: {
        active: Boolean,
        class_uuid: String,
        student_uuid: String
    },
    data() {
        return {
            level: "changes",
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
    methods: {
        ...mapMutations(["ADD_FEEDBACK"]),
        ...mapMutations("db", ["RESET_STUDENT"]),
        back() {
            this.$emit("update:active", false)
        },
        reset(class_uuid, student_uuid) {
            this.RESET_STUDENT({class_uuid, student_uuid})
            this.ADD_FEEDBACK("Student reset")
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
</style>
