<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title>Import Class List</md-dialog-title>

        <md-dialog-content>
            <p>Enter each class name on a line by itself. Duplicate classes will be merged.</p>

            <md-field>
                <label>Names</label>
                <md-textarea ref="names" v-model="names" md-autogrow></md-textarea>
            </md-field>

        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="back">Cancel</md-button>
            <md-button class="md-primary"
                @click="import_classes(names)"
                :disabled="names == null || names ===''"
                >
                Import
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import {mapMutations} from "vuex"
export default {
    name: "app-import-classes",
    props: {
        active: Boolean
    },
    data() {
        return {
            names: ""
        }
    },
    watch: {
        active(val) {
            if (val) {
                this.names = ""
                this.focus()
            }
        }
    },
    methods: {
        ...mapMutations(["ADD_FEEDBACK"]),
        ...mapMutations("db", ["IMPORT_CLASSES"]),
        focus() {
            window.setTimeout(() => {
                if (this.$refs.names) {
                    this.$refs.names.$el.focus()
                }
            }, 200)
        },
        back() {
            this.$emit("update:active", false)
        },
        import_classes(names_str) {
            const split_names = names_str.split(/\r?\n/)
            var names = []
            for (var i = 0; i < split_names.length; i++) {
                if (split_names[i].trim() != "") {
                    names.push(split_names[i].trim())
                }
            }
            this.IMPORT_CLASSES(names)
            this.ADD_FEEDBACK("Classes imported")
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
</style>
