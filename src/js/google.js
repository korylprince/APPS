/*global gapi*/
/*global CLIENT_ID*/

import {DB} from "./db.js"

const google = {
    _db_id: null,

    async gapi_init() {
        var load = new Promise((resolve, reject) => {
            gapi.load("client:auth2", {
                callback: resolve,
                onerror: reject
            })
        })

        try {
            await load
        } catch (err) {
            console.error("Error loading gapi:", err)
            throw Error("Unable to load gapi libraries")
        }

        try {
            await gapi.client.init({
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
                clientId: CLIENT_ID,
                scope: "https://www.googleapis.com/auth/drive.appdata"
            })
        } catch (err) {
            console.error("Error initializing gapi:", err)
            throw Error("Unable to initialize gapi libraries")
        }
    },
    async init() {
        await this.gapi_init()

        var auth = gapi.auth2.getAuthInstance()
        await auth
        var signin_status = auth.isSignedIn.get()
        if (!signin_status) { return {signin_status, user: {name: null, email: null, image_url: null}} }

        var user = auth.currentUser.get()
        var name = user.getBasicProfile().getName()
        var email = user.getBasicProfile().getEmail()
        var image_url = user.getBasicProfile().getImageUrl()

        return {signin_status, user: {name, email, image_url}}
    },
    attach_handlers(update_signin_status, update_user) {
        var auth = gapi.auth2.getAuthInstance()
        auth.isSignedIn.listen(update_signin_status)
        auth.currentUser.listen(update_user)
    },
    signin() {
        return gapi.auth2.getAuthInstance().signIn()
    },
    signout() {
        return gapi.auth2.getAuthInstance().signOut()
    },
    async get_db_id() {
        if (this._db_id) { return this._db_id }

        try {
            var response = await gapi.client.drive.files.list({
                spaces: "appDataFolder",
                q: "name = 'db.json'"
            })
        } catch (err) {
            console.error("Error getting db.json ID:", err)
            throw Error("Error getting db.json ID")
        }

        // db.json doesn't exist
        if (response.result.files.length === 0) {
            return null
        }

        if (response.result.files.length > 1) {
            console.error("Multiple db.json files present")
            throw Error("Multiple db.json files present")
        }

        this._db_id = response.result.files[0].id
        return this._db_id
    },
    async init_db() {
        var db_id = await this.get_db_id()

        if (db_id) {
            return await this.read_db()
        }

        await this.create_db()

        return await this.read_db()
    },
    async create_db() {
        try {
            var response = await gapi.client.drive.files.create({
                resource: {
                    name: "db.json",
                    mimeType: "application/json",
                    parents: ["appDataFolder"]
                },
                fields: "id"
            })
        } catch (err) {
            console.error("Error creating database:", err)
            throw Error("Unable to create database")
        }
        this._db_id = response.result.id

        return this.write_db(DB.init())
    },
    async read_db() {
        var db_id = await this.get_db_id()
        try {
            var response = await gapi.client.drive.files.get({
                fileId: db_id,
                alt: "media"
            })
        } catch (err) {
            console.error("Error reading database:", err)
            throw Error("Unable to read database")
        }

        try {
            return DB.assign(response.result)
        } catch (err) {
            console.error("Error parsing database:", err)
            throw Error("Unable to parse database")
        }
    },
    async list_db_revisions() {
        var db_id = await this.get_db_id()
        try {
            var response = await gapi.client.drive.revisions.list({
                fileId: db_id
            })
            return response.result.revisions
        } catch (err) {
            console.error("Error listing database revisions:", err)
            throw Error("Unable to list database revisions")
        }
    },
    async read_db_revision(revision_id) {
        var db_id = await this.get_db_id()
        try {
            var response = await gapi.client.drive.revisions.get({
                fileId: db_id,
                revisionId: revision_id,
                alt: "media"
            })
        } catch (err) {
            console.error("Error reading database revision:", err)
            throw Error("Unable to read database revision")
        }

        try {
            return DB.assign(response.result)
        } catch (err) {
            console.error("Error parsing database revision:", err)
            throw Error("Unable to parse database revision")
        }
    },
    async write_db(db) {
        var db_id = await this.get_db_id()
        try {
            await gapi.client.request({
                path: "/upload/drive/v3/files/" + db_id,
                method: "PATCH",
                params: {uploadType: "media", fields: "size"},
                body: db.stringify()
            })
        } catch (err) {
            console.error("Error writing database:", err)
            throw Error("Unable to read write")
        }
    }
}

export default google
