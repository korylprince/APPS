import store from "../store"

export default function setTitle(route) {
    switch (route.name) {
        case "signin":
            document.title = "APPS - Sign In"
            break
        case "settings":
            document.title = "APPS - Settings"
            break
        case "revisions":
            document.title = "APPS - Revisions"
            break
        case "dashboard":
            document.title = "APPS - Dashboard"
            break
        case "view-class": {
            let class_name = null

            const cls = store.state.db.db.findClass(route.params.class_uuid)
            if (cls != null) {
                class_name = cls.name
            }
            document.title = "APPS - " + class_name
            break
        }
        case "view-student": {
            let class_name = null
            let student_name = null

            const cls = store.state.db.db.findClass(route.params.class_uuid)
            if (cls != null) {
                class_name = cls.name
                const student = cls.findStudent(route.params.student_uuid)
                if (student != null) {
                    student_name = student.name
                }
            }

            document.title = "APPS - " + class_name + " - " + student_name
            break
        }
        default:
            document.title = "APPS"
    }
}
