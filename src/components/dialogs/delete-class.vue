<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title>Delete Class?</md-dialog-title>

        <md-dialog-content v-if="cls">
            <p>Are you sure you want to delete your <strong>{{cls.name}}</strong> class?
                <br />This action can't be undone.
            </p>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="back">Cancel</md-button>
            <md-button class="md-primary"
                @click="delete_class(class_uuid)"
                >
                Delete
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import {mapState, mapMutations} from "vuex"
export default {
    name: "app-delete-class",
    props: {
        active: Boolean,
        class_uuid: String
    },
    computed: {
        ...mapState("db", ["db"]),
        cls() {
            return this.db.findClass(this.class_uuid)
        }
    },
    methods: {
        ...mapMutations(["ADD_FEEDBACK"]),
        ...mapMutations("db", ["REMOVE_CLASS"]),
        back() {
            this.$emit("update:active", false)
        },
        delete_class(class_uuid) {
            this.REMOVE_CLASS(class_uuid)
            this.ADD_FEEDBACK("Class deleted")
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
</style>
