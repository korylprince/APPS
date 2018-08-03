<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title>Reset Class?</md-dialog-title>

        <md-dialog-content v-if="cls">
            <div>
                <md-radio v-model="level" value="changes">Changes</md-radio>
                <md-radio v-model="level" value="students">Students</md-radio>
            </div>
            <p>
                <span v-if="level === 'changes'">
                    Are you sure you want to clear all <strong>changes</strong> from all students in <strong>{{cls.name}}</strong>?
                </span>
                <span v-if="level === 'students'">
                    Are you sure you want to clear all <strong>students</strong> from <strong>{{cls.name}}</strong>?
                </span>
                <br />This action can't be undone.
            </p>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="back">Cancel</md-button>
            <md-button class="md-primary"
                @click="reset(class_uuid, level)"
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
        class_uuid: String
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
        }
    },
    methods: {
        ...mapMutations(["ADD_FEEDBACK"]),
        ...mapMutations("db", ["RESET_CLASS"]),
        back() {
            this.$emit("update:active", false)
        },
        reset(class_uuid, level) {
            this.RESET_CLASS({uuid: class_uuid, level})
            this.ADD_FEEDBACK("Class reset")
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
</style>
