class SettingsManager {
    constructor(client) {
        this.client = client
        this.settingsArray = []
    }

    fetch() {
        return new Promise((resolve, reject) => {
            this.client.db.all(`SELECT * FROM settings`, (err, rows) => {
                if (err) {
                    reject(err)
                    return
                }
                if (rows.length > 0) {
                    const settings = rows[0]
                    for (let setting in settings) {
                        this[setting] = settings[setting]
                        this.settingsArray.push(setting)
                    }
                    resolve()
                } else {
                    reject(new Error('no settings found'))
                    console.error("No settings row D:")
                }
            })
        })
    }

    write() {
        return new Promise((resolve, reject) => {
            let sql = ""
            this.settingsArray.forEach(setting => {
                sql = `${sql.length < 0 ? ", " : ""}${setting} = ${this[setting] ? this[setting] : null}`
            })
            this.client.db.all(`UPDATE settings SET ${sql}`, (err) => {
                if (err) return reject(err)
                resolve(this)
            })
        })
    }
}

module.exports = SettingsManager