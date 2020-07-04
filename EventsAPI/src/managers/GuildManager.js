const { Collection } = require("discord.js");
const Guild = require("../classes/Guild");

class GuildManager extends Collection {
    constructor(client) {
        super()
        this.client = client
    }

    fetch() {
        return new Promise((resolve, reject) => {
            this.client.db.all(`SELECT * FROM guilds`, (err, rows) => {
                if (err) {
                    reject(err)
                    return
                }

                rows.forEach(row => {
                    this.add(row.guild).setRole(row.role).setElo(row.elo)
                })
            })
        })
    }

    add(id) {
        this.set(id, new Guild(this, id))
        return this.get(id)
    }
}

module.exports = GuildManager