<template>
    <md-dialog :md-active="active" @md-clicked-outside="back">
        <md-dialog-title>
            Add Student
            <div class="md-subheading" v-if="cls">{{cls.name}}</div>
        </md-dialog-title>

        <md-dialog-content>
            <md-field :class="{'md-invalid': errors.has('name')}">
                <label>Name</label>
                <md-input ref="name" v-model="name" name="name" data-vv-name="name" v-validate="'required'" @keydown.enter="add(class_uuid, name)"></md-input>
                <span class="md-error">{{errors.first('name')}}</span>
            </md-field>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="back">Cancel</md-button>
            <md-button class="md-primary"
                @click="add(class_uuid, name)"
                :disabled="errors.any() || name == ''"
                >
                Add
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import {mapState, mapMutations} from "vuex"
export default {
    name: "app-add-student",
    props: {
        active: Boolean,
        class_uuid: String,
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
        }
    },
    watch: {
        active(val) {
            if (val) {
                this.name = ""
                this.focus()
            }
        }
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK"]),
        ...mapMutations("db", ["ADD_STUDENT"]),
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
        async add(class_uuid, name) {
            try {
                await this.$validator.validateAll()
            } catch (err) {
                this.UPDATE_ERROR("Form validation error")
                console.error("Form validation error:", err)
                return
            }

            this.ADD_STUDENT({class_uuid, name})
            this.ADD_FEEDBACK("Student added")
            this.back()
        }
    }
}
</script>

<style lang="stylus" scoped>
</style>
