<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title>
            Delete Student?
            <div class="md-subheading" v-if="cls">{{cls.name}}</div>
        </md-dialog-title>

        <md-dialog-content v-if="student">
            <p>Are you sure you want to delete <strong>{{student.name}}</strong> from <strong>{{cls.name}}</strong>?
                <br />This action can't be undone.
            </p>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="back">Cancel</md-button>
            <md-button class="md-primary"
                @click="delete_student(class_uuid, student_uuid)"
                >
                Delete
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import {mapState, mapMutations} from "vuex"
export default {
    name: "app-delete-student",
    props: {
        active: Boolean,
        class_uuid: String,
        student_uuid: String
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
        ...mapMutations("db", ["REMOVE_STUDENT"]),
        back() {
            this.$emit("update:active", false)
        },
        delete_student(class_uuid, student_uuid) {
            this.REMOVE_STUDENT({class_uuid, student_uuid})
            this.ADD_FEEDBACK("Student deleted")
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
</style>
