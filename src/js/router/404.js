import store from "../store.js"

export default function check404(route) {
    const db = store.state.db.db
    switch (route.name) {
        case "view-class":
            if (db.findClass(route.params.class_uuid)) {
                return
            }

            store.commit("ADD_FEEDBACK", "Class not found")
            return {name: "dashboard"}
        case "view-student":
            const cls = db.findClass(route.params.class_uuid)
            if (cls == null) {
                store.commit("ADD_FEEDBACK", "Class not found")
                return {name: "dashboard"}
            }

            if (cls.findStudent(route.params.student_uuid)) {
                return
            }

            store.commit("ADD_FEEDBACK", "Student not found")
            return {name: "view-class", params: {class_uuid: cls.uuid}}
        default:
    }
}
