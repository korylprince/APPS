import uuidv4 from "uuid/v4"

var blobCache = {
    "json": {},
    "csv": {}
}

class Config {
    constructor(base_score, changes) {
        this.base_score = base_score || 100
        this.changes = changes || []
    }

    static assign(obj) {
        var changes = []
        for (var i = 0; i < obj.changes.length; i++) {
            changes.push(Change.assign(obj.changes[i]))
        }
        return new Config(obj.base_score, changes)
    }

    sort() {
        this.changes.sort((a, b) => {
            if (a.description.toLowerCase() < b.description.toLowerCase()) {
                return -1
            }
            if (a.description.toLowerCase() > b.description.toLowerCase()) {
                return 1
            }
            if (a.uuid < b.uuid) {
                return -1
            }
            if (a.uuid > b.uuid) {
                return 1
            }
            return 0
        })
    }

    addChange(description, points) {
        this.changes.push(new Change(description, points))
    }

    findChange(uuid) {
        return this.changes[this.changes.findIndex(change => change.uuid === uuid)]
    }

    removeChange(uuid) {
        var idx = this.changes.findIndex(change => change.uuid === uuid)
        if (idx < 0) { return }
        this.changes.splice(idx, 1)
    }

    resetChanges() {
        this.changes = []
    }
}

class Change {
    constructor(description, points, date, uuid) {
        this.description = description
        this.points = points
        this.date = date
        this.uuid = uuid || uuidv4()
    }

    static assign(obj) {
        return new Change(obj.description, obj.points, obj.date, obj.uuid)
    }
}

class Student {
    constructor(name, changes, uuid) {
        this.name = name
        this.changes = changes || []
        this.uuid = uuid || uuidv4()
    }

    static assign(obj) {
        var changes = []
        for (var i = 0; i < obj.changes.length; i++) {
            changes.push(Change.assign(obj.changes[i]))
        }
        return new Student(obj.name, changes, obj.uuid)
    }

    sort() {
        this.changes.sort((a, b) => {
            if (a.date < b.date) {
                return -1
            }
            if (a.date > b.date) {
                return 1
            }
            if (a.uuid < b.uuid) {
                return -1
            }
            if (a.uuid > b.uuid) {
                return 1
            }
            return 0
        })
    }

    addChange(description, points) {
        this.changes.push(new Change(description, points, (new Date()).valueOf()))
    }

    findChange(uuid) {
        return this.changes[this.changes.findIndex(change => change.uuid === uuid)]
    }

    removeChange(uuid) {
        var idx = this.changes.findIndex(change => change.uuid === uuid)
        if (idx < 0) { return }
        this.changes.splice(idx, 1)
    }

    resetChanges() {
        this.changes = []
    }

    total_points() {
        var s = 0
        for (var i = 0; i < this.changes.length; i++) {
            s += this.changes[i].points
        }
        return s
    }
}

class Class {
    constructor(name, students, uuid) {
        this.name = name
        this.students = students || []
        this.uuid = uuid || uuidv4()
    }

    static assign(obj) {
        var students = []
        for (var i = 0; i < obj.students.length; i++) {
            students.push(Student.assign(obj.students[i]))
        }
        return new Class(obj.name, students, obj.uuid)
    }

    csvString(base_score) {
        var csvData = ""

        for (var i = 0; i < this.students.length; i++) {
            csvData += "\""
            csvData += [this.name, this.students[i].name, (base_score + this.students[i].total_points())].join("\",\"")
            csvData += "\"\r\n"
        }
        return csvData
    }

    csvURL(base_score) {
        const url = blobCache["csv"][this.uuid]
        if (url) {
            URL.revokeObjectURL(url)
        }
        const csvData = "\"Class Name\",\"Student Name\",\"Points\"\r\n" +
            this.csvString(base_score)

        blobCache["csv"][this.uuid] = URL.createObjectURL(
            new Blob([csvData], {type: "text/csv"})
        )
        return blobCache["csv"][this.uuid]
    }

    sort() {
        this.students.sort((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1
            }
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1
            }
            if (a.uuid < b.uuid) {
                return -1
            }
            if (a.uuid > b.uuid) {
                return 1
            }
            return 0
        })

        for (var i = 0; i < this.students.length; i++) {
            this.students[i].sort()
        }
    }

    addStudent(name) {
        this.students.push(new Student(name))
    }

    findStudent(uuid) {
        return this.students[this.students.findIndex(student => student.uuid === uuid)]
    }

    findStudentByName(name) {
        return this.students[this.students.findIndex(student => student.name === name)]
    }

    removeStudent(uuid) {
        var idx = this.students.findIndex(student => student.uuid === uuid)
        if (idx < 0) { return }
        this.students.splice(idx, 1)
    }

    resetChanges() {
        for (var i = 0; i < this.students.length; i++) {
            this.students[i].resetChanges()
        }
    }

    resetStudents() {
        this.students = []
    }
}

class DB {
    constructor(config, classes, uuid) {
        this.config = config
        this.classes = classes || []
        this.uuid = uuid || uuidv4()
    }

    static init() {
        return new DB(new Config(100, []), [])
    }

    static assign(obj) {
        var config = Config.assign(obj.config)

        var classes = []
        for (var i = 0; i < obj.classes.length; i++) {
            classes.push(Class.assign(obj.classes[i]))
        }
        return new DB(config, classes, obj.uuid)
    }

    static parse(str) {
        var obj = JSON.parse(str)

        return DB.assign(obj)
    }

    stringify() {
        return JSON.stringify(this)
    }

    copy() {
        return DB.parse(this.stringify())
    }

    compare(db) {
        if (db == null) { return false }
        return this.stringify() === db.stringify()
    }

    jsonURL() {
        const url = blobCache["json"][this.uuid]
        if (url) {
            URL.revokeObjectURL(url)
        }
        blobCache["json"][this.uuid] = URL.createObjectURL(
            new Blob([JSON.stringify(this, null, 4)], {type: "application/json"})
        )
        return blobCache["json"][this.uuid]
    }

    csvURL() {
        const url = blobCache["csv"][this.uuid]
        if (url) {
            URL.revokeObjectURL(url)
        }

        var csvData = "\"Class Name\",\"Student Name\",\"Points\"\r\n"

        for (var i = 0; i < this.classes.length; i++) {
            csvData += this.classes[i].csvString(this.config.base_score)
        }

        blobCache["csv"][this.uuid] = URL.createObjectURL(
            new Blob([csvData], {type: "text/csv"})
        )
        return blobCache["csv"][this.uuid]
    }

    sort() {
        this.config.sort()

        this.classes.sort((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1
            }
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1
            }
            if (a.uuid < b.uuid) {
                return -1
            }
            if (a.uuid > b.uuid) {
                return 1
            }
            return 0
        })

        for (var i = 0; i < this.classes.length; i++) {
            this.classes[i].sort()
        }
    }

    addClass(name) {
        this.classes.push(new Class(name))
    }

    findClass(uuid) {
        return this.classes[this.classes.findIndex(cls => cls.uuid === uuid)]
    }

    findClassByName(name) {
        return this.classes[this.classes.findIndex(cls => cls.name === name)]
    }

    removeClass(uuid) {
        var idx = this.classes.findIndex(cls => cls.uuid === uuid)
        if (idx < 0) { return }
        this.classes.splice(idx, 1)
    }

    resetChanges() {
        for (var i = 0; i < this.classes.length; i++) {
            this.classes[i].resetChanges()
        }
    }

    resetStudents() {
        for (var i = 0; i < this.classes.length; i++) {
            this.classes[i].resetStudents()
        }
    }

    resetClasses() {
        this.classes = []
    }

    reset() {
        this.resetClasses()
        this.config.resetChanges()
        this.config.base_score = 100
    }
}

export {Config, Change, Student, Class, DB}
