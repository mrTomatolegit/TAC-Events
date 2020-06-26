class SettingsManager {
    constructor(client) {
        this.client = client
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
                    }
                    resolve()
                } else {
                    reject(new Error('no settings found'))
                    console.error("No settings row D:")
                }
            })
        })
    }
}

module.exports = SettingsManager