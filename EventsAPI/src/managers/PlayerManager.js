const Player = require('../classes/Player.js')
const {Collection} = require("discord.js")

class PlayerManager extends Collection{
    constructor(client) {
        super()
        this.client = client
    }

    add(id, uuid) {
        this.set(id, new Player(this, id, uuid))
        return this.get(id)
    }

    remove(id) {
        this.delete(id)

        this.client.db.all(`DELETE FROM players WHERE discord = $discord`, {$discord: id}, (err, rows) => {
            if (err) {
                reject(err)
                return 
            }
            rows.forEach(row => {
                this.add(row.discord, row.minecraft).setRegistryDate(new Date(row.registeredAt))
            })
            resolve()
        })
    }

    fetch() {
        return new Promise((resolve, reject) => {
            this.client.db.all(`SELECT * FROM players`, (err, rows) => {
                if (err) {
                    reject(err)
                    return 
                }
                rows.forEach(row => {
                    this.add(row.discord, row.minecraft).setRegistryDate(new Date(row.registeredAt))
                })
                resolve(this)
            })
        })
    }
}

module.exports = PlayerManager