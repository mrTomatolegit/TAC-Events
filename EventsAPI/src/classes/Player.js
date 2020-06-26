const { PlayerManager } = require("../..")

class Player {
    /**
     * 
     * @param {PlayerManager} manager 
     * @param {string} discord 
     * @param {string} minecraft 
     */
    constructor(manager, discord, minecraft) {
        this.discord = discord
        this.minecraft = minecraft
        this.manager = manager
        this.client = manager.client
        this.registeredAt = new Date()
    }

    setRegistryDate(date) {
        this.registeredAt = date
    }

    get user() {
        return this.client.users.cache.get(this.discord)
    }

    getIGN() {
        return this.client.mojang.getName(this.minecraft)
    }

    write() {
        return new Promise((resolve, reject) => {
            this.client.db.all(`SELECT * FROM players WHERE discord = $discord OR minecraft = $minecraft`, {
                $discord: this.discord,
                $minecraft: this.minecraft
            }, (err, rows) => {
                if (err) {
                    reject(err)
                    return
                }
                if (rows.length < 1) {
                    this.client.db.all(`INSERT INTO players(discord, minecraft) VALUES($discord, $minecraft)`, {
                        $discord: this.discord,
                        $minecraft: this.minecraft
                    }, (err) => {
                        if (err) {
                            reject(err)
                            return
                        }
                        resolve(this)
                    })
                } else {
                    this.client.db.all(`UPDATE players SET minecraft = $minecraft WHERE discord = $discord`, {
                        $discord: this.discord,
                        $minecraft: this.minecraft
                    }, (err) => {
                        if (err) {
                            reject(err)
                            return
                        }
                        resolve(this)
                    })
                }
            })
        })
    }
}

module.exports = Player