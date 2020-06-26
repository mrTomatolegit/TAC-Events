const { Collection } = require("discord.js")
const Announce = require("../classes/Announce")

class AnnounceManager extends Collection {
    constructor(client) {
        super()
        this.client = client
    }

    fetch() {
        return new Promise((resolve ,reject) => {
            this.client.db.all(`SELECT * FROM announcements`, (err, rows) => {
                if (err) {
                    reject(err)
                    return
                }
                if (rows.length < 1) {
                    resolve(this)
                }
                rows.forEach(row => {
                    const channel = this.client.channels.cache.get(row.channel)
                    if (channel) {
                        const role = channel.guild.roles.cache.get(row.role)
                        this.set(channel.guild.id, new Announce(this, channel, role))
                    }
                })
                resolve()
            })
        })
    }

    add(channel) {
        const found = this.get(channel.guild.id)
        if (found) {
            found.setChannel(channel)
        } else {
            this.set(channel.guild.id, new Announce(this, channel, null))
        }
        return this.get(channel.guild.id)
    }
}

module.exports = AnnounceManager