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

    async getIGN() {
        return await this.client.mojang.getName(this.minecraft)
    }

    async update() {
        const member = this.client.guilds.cache.get("617635094106210316").members.cache.get(this.discord)
        if (member) {
            member.setNickname(await this.getIGN())
            member.roles.add("730086771198525482").catch(() => {})
            const memberGuildID = await this.client.keymanager.next().findGuildByPlayer(this.minecraft).catch(() => {})
            if (this.client.hypixelGuilds.get(memberGuildID) && this.client.hypixelGuilds.get(memberGuildID).role) {
                let removeRoles = []
                this.client.hypixelGuilds.forEach(guild => {
                    if (guild.role && guild.role.id !== this.client.hypixelGuilds.get(memberGuildID).role.id) {
                        removeRoles.push(guild.role)
                    }
                })
                await member.roles.remove(removeRoles).catch(() => {})
                await member.roles.add(this.client.hypixelGuilds.get(memberGuildID).role).catch(() => {})
            }
        }
        return this
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