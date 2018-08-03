import AppDashboard from "../../components/dashboard.vue"
import AppSettings from "../../components/settings.vue"
import AppSignin from "../../components/signin.vue"
import AppViewClass from "../../components/view-class.vue"
import AppViewRevisions from "../../components/view-revisions.vue"
import AppViewStudent from "../../components/view-student.vue"

export default [
    {name: "signin", path: "/signin", component: AppSignin},
    {name: "settings", path: "/settings", component: AppSettings},
    {name: "revisions", path: "/settings/revisions", component: AppViewRevisions},
    {name: "dashboard", path: "/", component: AppDashboard},
    {name: "view-class", path: "/classes/:class_uuid", component: AppViewClass, props: true},
    {name: "view-student", path: "/classes/:class_uuid/students/:student_uuid", component: AppViewStudent, props: true},
    {path: "*", redirect: {name: "dashboard"}}
]
