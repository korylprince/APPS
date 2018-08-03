<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title>Reset Quick Changes?</md-dialog-title>

        <md-dialog-content>
            <p>Are you sure you want to clear all <strong>quick changes</strong>?
                <br />This action can't be undone.
            </p>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="back">Cancel</md-button>
            <md-button class="md-primary"
                @click="reset"
                >
                Reset
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import {mapMutations} from "vuex"
export default {
    name: "app-reset-quick-changes",
    props: {
        active: Boolean
    },
    methods: {
        ...mapMutations(["ADD_FEEDBACK"]),
        ...mapMutations("db", ["RESET_DB"]),
        back() {
            this.$emit("update:active", false)
        },
        reset() {
            this.RESET_DB("quick_changes")
            this.ADD_FEEDBACK("Quick changes reset")
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
</style>
