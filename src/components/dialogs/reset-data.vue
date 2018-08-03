<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title>Reset All?</md-dialog-title>

        <md-dialog-content>
            <div>
                <md-radio v-model="level" value="changes">Changes</md-radio>
                <md-radio v-model="level" value="students">Students</md-radio>
                <md-radio v-model="level" value="classes">Classes</md-radio>
                <md-radio v-model="level" value="all">Everything</md-radio>
            </div>
            <p>
                <span v-if="level === 'changes'">
                    Are you sure you want to clear all <strong>changes</strong> from all students in all classes?
                </span>
                <span v-if="level === 'students'">
                    Are you sure you want to clear all <strong>students</strong> from all classes?
                </span>
                <span v-if="level === 'classes'">
                    Are you sure you want to clear all <strong>classes</strong>?
                </span>
                <span v-if="level === 'all'">
                    Are you sure you want to clear <strong>everything</strong>? This includes all classes and settings (including quick changes.)
                </span>
                <br />This action can't be undone.
            </p>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="back">Cancel</md-button>
            <md-button class="md-primary"
                @click="reset(level)"
                >
                Reset
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import {mapMutations} from "vuex"
export default {
    name: "app-reset-data",
    props: {
        active: Boolean
    },
    data() {
        return {
            level: "changes",
        }
    },
    methods: {
        ...mapMutations(["ADD_FEEDBACK"]),
        ...mapMutations("db", ["RESET_DB"]),
        back() {
            this.$emit("update:active", false)
        },
        reset(level) {
            this.RESET_DB(level)
            this.ADD_FEEDBACK("Database reset")
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
</style>
