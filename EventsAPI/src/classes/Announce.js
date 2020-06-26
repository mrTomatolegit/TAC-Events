class Announce {
    constructor(manager, channel, role) {
        this.manager = manager
        this.client = manager.client
        this.channel = channel
        this.role = role || null
        this.oldChannelID = null
        this.oldRoleID = null
    }

    write() {
        return new Promise((resolve, reject) => {
            this.client.db.all(`SELECT * FROM announcements`, (err, rows) => {
                if (err) {
                    reject(err)
                    return
                }
                if (rows.find(r => r.channel === (this.oldChannelID || this.channel.id) || r.role === (this.oldRoleID || (this.role ? this.role.id : null) || null))) {
                    this.client.db.all(`UPDATE announcements SET channel = $channel, role = $role WHERE channel = $oldChannel OR role = $oldRole`, {
                        $channel: this.channel.id,
                        $role: this.role ? this.role.id : null,
                        $oldChannel: this.oldChannelID || this.channel.id,
                        $oldRole: this.oldRoleID || this.role.id || null
                    }, (err) => {
                        if (err) {
                            reject(err)
                            return
                        }
                        resolve(this)
                    })
                } else {
                    this.client.db.all(`INSERT INTO announcements(channel, role) VALUES($channel, $role)`, {
                        $channel: this.channel.id,
                        $role: this.role ? this.role.id : null
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
    setChannel(newChannel) {
        if (!newChannel) {
            return this.delete()
        }
        this.oldChannelID = this.channel ? this.channel.id : null
        this.channel = newChannel
        return this
    }

    setRole(newRole) {
        this.oldRoleID = this.role ? this.role.id : null
        this.role = newRole || null
        return this
    }

    delete() {
        this.manager.delete(this.channel.guild.id)
        this.client.db.all(`DELETE FROM announcements WHERE channel = $channel`, {
            $channel: this.channel.id
        }, (err) => {
            if (err) {
                throw err
            }
        })
        return this
    }
}

module.exports = Announce