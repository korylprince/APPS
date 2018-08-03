import google from "./google.js"

import {DB} from "./db.js"

const db = {
    namespaced: true,
    state: {
        data_state: "loading",
        db: null,
        _db: null,
        data_inconsistency: false,
        revisions: null
    },
    getters: {
        db_json(state) {
            if (state.db == null) { return null }
            return state.db.stringify()
        },
        dirty(state) {
            if (state.db == null || state._db == null) { return false }
            return !(state.db.compare(state._db))
        },
        save_status(state, getters) {
            if (state.data_state === "loading") { return "Loading..." }
            if (state.data_state === "saving") { return "Saving changes..." }
            if (state.data_state === "error") { return "Error" }
            if (getters.dirty) { return "Unsaved changes..." }
            return "All changes saved"
        }
    },
    mutations: {
        UPDATE_DATA_STATE(state, status) {
            state.data_state = status
        },
        REPLACE_DB(state, db) {
            db.sort()
            state.db = db
            state._db = db.copy()
        },
        UPDATE_BASE_DB(state, db) {
            state._db = db
        },
        UPDATE_DATA_INCONSISTENCY(state, status) {
            state.data_inconsistency = status
        },
        RESET_DB(state, level) {
            switch (level) {
                case "changes":
                    state.db.resetChanges()
                    break
                case "students":
                    state.db.resetStudents()
                    break
                case "classes":
                    state.db.resetClasses()
                    break
                case "quick_changes":
                    state.db.config.resetChanges()
                    break
                case "all":
                    state.db.reset()
                    break
            }
            state.db.sort()
        },
        UPDATE_BASE_SCORE(state, score) {
            state.db.config.base_score = score
        },
        ADD_CONFIG_CHANGE(state, {description, points}) {
            state.db.config.addChange(description, points)
            state.db.config.sort()
        },
        MODIFY_CONFIG_CHANGE(state, {uuid, description, points}) {
            var change = state.db.config.findChange(uuid)
            if (change == null) { return }
            change.description = description
            change.points = points
            state.db.config.sort()
        },
        REMOVE_CONFIG_CHANGE(state, uuid) {
            state.db.config.removeChange(uuid)
            state.db.config.sort()
        },
        RESET_CONFIG_CHANGES(state) {
            state.db.config.resetChanges()
            state.db.config.sort()
        },
        IMPORT_CLASSES(state, names) {
            for (var i = 0; i < names.length; i++) {
                if (state.db.findClassByName(names[i]) == null) {
                    state.db.addClass(names[i])
                }
            }
            state.db.sort()
        },
        ADD_CLASS(state, name) {
            state.db.addClass(name)
            state.db.sort()
        },
        MODIFY_CLASS(state, {uuid, name}) {
            var cls = state.db.findClass(uuid)
            if (cls == null) { return }
            cls.name = name
            state.db.sort()
        },
        REMOVE_CLASS(state, uuid) {
            state.db.removeClass(uuid)
            state.db.sort()
        },
        IMPORT_CLASS_ROSTER(state, {uuid, names}) {
            var cls = state.db.findClass(uuid)
            if (cls == null) { return }
            for (var i = 0; i < names.length; i++) {
                if (cls.findStudentByName(names[i]) == null) {
                    cls.addStudent(names[i])
                }
            }
            cls.sort()
        },
        RESET_CLASS(state, {uuid, level}) {
            var cls = state.db.findClass(uuid)
            if (cls == null) { return }
            switch (level) {
                case "changes":
                    cls.resetChanges()
                    break
                case "students":
                    cls.resetStudents()
                    break
            }
            state.db.sort()
        },
        ADD_STUDENT(state, {class_uuid, name}) {
            var cls = state.db.findClass(class_uuid)
            if (cls == null) { return }
            cls.addStudent(name)
            cls.sort()
        },
        MODIFY_STUDENT(state, {class_uuid, student_uuid, name}) {
            var cls = state.db.findClass(class_uuid)
            if (cls == null) { return }
            var student = cls.findStudent(student_uuid)
            if (student == null) { return }
            student.name = name
            cls.sort()
        },
        REMOVE_STUDENT(state, {class_uuid, student_uuid}) {
            var cls = state.db.findClass(class_uuid)
            if (cls == null) { return }
            cls.removeStudent(student_uuid)
            cls.sort()
        },
        RESET_STUDENT(state, {class_uuid, student_uuid}) {
            var cls = state.db.findClass(class_uuid)
            if (cls == null) { return }
            var student = cls.findStudent(student_uuid)
            if (student == null) { return }
            student.resetChanges()
            cls.sort()
        },
        ADD_STUDENT_CHANGE(state, {class_uuid, student_uuid, description, points}) {
            var cls = state.db.findClass(class_uuid)
            if (cls == null) { return }
            var student = cls.findStudent(student_uuid)
            if (student == null) { return }
            student.addChange(description, points)
            student.sort()
        },
        MODIFY_STUDENT_CHANGE(state, {class_uuid, student_uuid, change_uuid, description, points}) {
            var cls = state.db.findClass(class_uuid)
            if (cls == null) { return }
            var student = cls.findStudent(student_uuid)
            if (student == null) { return }
            var change = student.findChange(change_uuid)
            change.description = description
            change.points = points
            change.date = (new Date()).valueOf()
            student.sort()
        },
        REMOVE_STUDENT_CHANGE(state, {class_uuid, student_uuid, change_uuid}) {
            var cls = state.db.findClass(class_uuid)
            if (cls == null) { return }
            var student = cls.findStudent(student_uuid)
            if (student == null) { return }
            student.removeChange(change_uuid)
            student.sort()
        },
        REPLACE_REVISIONS(state, revisions) {
            state.revisions = revisions
        }
    },
    actions: {
        async init(context) {
            context.commit("START_LOADING", null, {root: true})
            context.commit("UPDATE_DATA_STATE", "loading")
            try {
                var db = await google.init_db()
                context.dispatch("list_revisions")
            } catch (err) {
                context.commit("UPDATE_ERROR", "An error occurred trying to read the database.", {root: true})
                console.error("Error initializing database:", err)
                context.commit("UPDATE_DATA_STATE", "error")
                context.commit("STOP_LOADING", null, {root: true})
                return
            }
            context.commit("UPDATE_DATA_STATE", "loaded")
            context.commit("STOP_LOADING", null, {root: true})
            context.commit("REPLACE_DB", db)
            context.commit("UPDATE_DATA_INCONSISTENCY", false)
        },
        async check_save(context) {
            context.commit("START_LOADING", null, {root: true})
            try {
                var db = await google.read_db()
            } catch (err) {
                context.commit("UPDATE_ERROR", "An error occurred trying to read the database.", {root: true})
                context.commit("STOP_LOADING", null, {root: true})
                return
            }

            if (!(context.state._db.compare(db))) {
                context.commit("UPDATE_DATA_INCONSISTENCY", true)
                context.commit("STOP_LOADING", null, {root: true})
                return
            }

            await context.dispatch("save")
            context.commit("STOP_LOADING", null, {root: true})
        },
        async save(context) {
            context.commit("START_LOADING", null, {root: true})
            context.commit("UPDATE_DATA_STATE", "saving")
            var db = context.state.db.copy()
            try {
                await google.write_db(db)
            } catch (err) {
                context.commit("UPDATE_ERROR", "An error occurred trying to save the database.", {root: true})
                context.commit("UPDATE_DATA_STATE", "error")
                context.commit("STOP_LOADING", null, {root: true})
                return
            }
            context.commit("UPDATE_DATA_STATE", "loaded")
            context.commit("STOP_LOADING", null, {root: true})
            context.commit("UPDATE_BASE_DB", db)
            context.commit("UPDATE_DATA_INCONSISTENCY", false)
        },
        async restore_file(context, file) {
            context.commit("START_LOADING", null, {root: true})
            context.commit("UPDATE_DATA_STATE", "saving")
            try {
                var json = await (new Promise((resolve, reject) => {
                    var reader = new FileReader()
                    reader.onload = evt => {
                        resolve(evt.target.result)
                    }
                    reader.onerror = error => {
                        reject(error)
                    }
                    reader.readAsText(file)
                }))
            } catch (err) {
                context.commit("UPDATE_ERROR", "An error occurred trying to read the backup file.", {root: true})
                console.error("Error reading backup file:", err)
                context.commit("UPDATE_DATA_STATE", "error")
                context.commit("STOP_LOADING", null, {root: true})
                return
            }

            try {
                var db = DB.parse(json)
            } catch (err) {
                context.commit("UPDATE_ERROR", "An error occurred trying to parse the backup file.", {root: true})
                console.error("Error parsing backup file:", err)
                context.commit("UPDATE_DATA_STATE", "error")
                context.commit("STOP_LOADING", null, {root: true})
                return
            }

            try {
                await google.write_db(db)
            } catch (err) {
                context.commit("UPDATE_ERROR", "An error occurred trying to save the database.", {root: true})
                context.commit("UPDATE_DATA_STATE", "error")
                context.commit("STOP_LOADING", null, {root: true})
                return
            }

            context.commit("UPDATE_DATA_STATE", "loaded")
            context.commit("STOP_LOADING", null, {root: true})
            context.commit("REPLACE_DB", db)
            context.commit("ADD_FEEDBACK", "Database restored", {root: true})
        },
        async list_revisions(context) {
            context.commit("START_LOADING", null, {root: true})
            try {
                var revisions = await google.list_db_revisions()
                revisions.sort((a, b) => {
                    if (a.modifiedTime > b.modifiedTime) {
                        return -1
                    }
                    if (a.modifiedTime < b.modifiedTime) {
                        return 1
                    }
                    return 0
                })

                context.commit("STOP_LOADING", null, {root: true})
                context.commit("REPLACE_REVISIONS", revisions)
            } catch (err) {
                context.commit("UPDATE_ERROR", "An error occurred trying to list database revisions.", {root: true})
                context.commit("STOP_LOADING", null, {root: true})
            }
        },
        async restore_revision(context, revision_id) {
            context.commit("START_LOADING", null, {root: true})
            context.commit("UPDATE_DATA_STATE", "saving")
            try {
                var db = await google.read_db_revision(revision_id)
            } catch (err) {
                context.commit("UPDATE_ERROR", "An error occurred trying to read the database revision.", {root: true})
                context.commit("UPDATE_DATA_STATE", "error")
                context.commit("STOP_LOADING", null, {root: true})
                return
            }

            try {
                await google.write_db(db)
            } catch (err) {
                context.commit("UPDATE_ERROR", "An error occurred trying to save the database.", {root: true})
                context.commit("UPDATE_DATA_STATE", "error")
                context.commit("STOP_LOADING", null, {root: true})
                return
            }

            context.commit("UPDATE_DATA_STATE", "loaded")
            context.commit("STOP_LOADING", null, {root: true})
            context.commit("REPLACE_DB", db)
            context.commit("ADD_FEEDBACK", "Database restored", {root: true})
        }
    }
}

export default db
