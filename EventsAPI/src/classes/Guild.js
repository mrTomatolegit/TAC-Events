class Guild {
    constructor(manager, id) {
        this.manager = manager
        this.client = manager.client
        this.id = id
        this.roleID = ""
        this.elo = 0
    }
    
    setRole(roleID) {
        this.roleID = roleID
        return this
    }

    get role() {
        const guild = this.client.guilds.cache.find(g => g.roles.cache.get(this.roleID))
        if (guild) {
            return guild.roles.cache.get(this.roleID)
        } else {
            return null
        }
    }

    setElo(elo) {
        this.elo = elo
        return this
    }

    hypixelFetch() {
        return new Promise((resolve ,reject) => {
            this.client.keymanager.next().getGuild(this.id).then(guild => {
                resolve(guild)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    write() {
        return new Promise((resolve ,reject) => {
            this.client.db.all(`SELECT * FROM guilds WHERE guild = $id`, {$id: this.id}, (err, rows) => {
                if (err) {
                    reject(err)
                    return
                }

                if (rows.length < 1) {
                    this.client.db.all(`INSERT INTO guilds(guild, role, elo) VALUES($guild, $role, $elo)`, {$guild: this.id, $role: this.roleID, $elo: this.elo}, (err) => {
                        if (err) return reject(err)
                        resolve(this)
                    })
                } else {
                    this.client.db.all(`UPDATE guilds SET role = $role, elo = $elo WHERE guild = $guild`, {$role:this.roleID, $elo: this.elo, $guild: this.id}, (err) => {
                        if (err) return reject(err)
                        resolve(this)
                    })
                }
            })
        })
    }

    remove() {
        this.manager.delete(this.id)
        this.client.db.all(`DELETE FROM guilds WHERE guild = $id`, {$id: this.id}, (err) => {
            if (err) {
                throw err
            }
        })
        delete this
    }
}

module.exports = Guild