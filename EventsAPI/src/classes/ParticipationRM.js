class ParticipationRM {
    constructor(client, data) {
        this.client = client
        this.eventID = data.id
        this.messageID = data.message

        this.client.on("messageReactionAdd", (messageReaction, user) => {
            if (messageReaction.message.id !== this.messageID) return


            const player = client.players.get(user.id)
            const event = this.event

            if (!player) return

            if (!event.canJoin) {
                const reason = event.participants.size < (event.max || 10000000) ? "registry time has run out (15 minutes before the event)" : "max participants reached"
                user.send(`You can no longer join that event, ${reason}`)
                return
            }
        
            if (event.participants.get(player.discord)) {
                user.send("You already signed up for `" + event.name + "`!")
                return
            }

            this.event.participants.add(player).write().then(() => {
                user.send(`🟩 You have been listed as a participant for \`${event.name}\` 🟩`)
            })
        })

        this.client.on("messageReactionRemove", (messageReaction, user) => {
            if (messageReaction.message.id !== this.messageID) return


            const player = client.players.get(user.id)
            const event = this.event

            if (!player) return

            if (!event.participants.get(player.discord)) {
                user.send("You are not signed up for `" + event.name + "`!")
                return
            }
        
            if (!event.canJoin) {
                user.send(`You can't leave this event now!`)
                return
            }

            this.event.participants.remove(player)
            user.send(`🟥 You have been unlisted as a participant for \`${event.name}\` 🟥`)
        })
    }

    get event() {
        return this.client.events.get(this.eventID)
    }

    remove() {
        return new Promise((resolve, reject) => {
            this.client.db.all(`DELETE FROM participationRMs WHERE message = $message`, {$message: this.messageID}, (err) => {
                if (err) return reject(err)

                resolve()
            })
        })
    }

    write() {
        return new Promise((resolve, reject) => {
            this.client.db.all(`SELECT * FROM participationRMs WHERE message = $message`, {
                $message: this.messageID
            }, (err, rows) => {
                if (err) {
                    reject(err)
                    return
                }
                if (rows.length < 1) {
                    this.client.db.all(`INSERT INTO participationRMs(id, message) VALUES($id, $message)`, {
                        $id: this.eventID,
                        $message: this.messageID
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

module.exports = ParticipationRM