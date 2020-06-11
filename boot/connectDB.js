exports.load = (client, reload) => {
    const sqlite = require("sqlite3")
    client.db = new sqlite.Database("./data/TAC-Events.db")

    client.events = []
    client.players = []


    client.newPlayer = (ID, UUID, written) => {
        const player = new client.Player(ID, UUID, written)
        return client.players[client.players.push(player)-1]
    }

    client.newEvent = (name, id, organiser) => {
        const event = new client.Event(name, id, organiser)
        return client.events[client.events.push(event)-1]
    }

    client.fetchEvents = async () => {
        client.db.all(`SELECT * FROM events`, (err, rows) => {
            if (err) throw err

            rows.forEach(row => {
                const event = client.newEvent(row.name, row.eventID, row.organiser)
                const date = row.date ? new Date(row.date) : null
                event.setDate(date)
                event.setMax(row.max)
            })
            client.db.all(`SELECT * FROM participants`, (err, rows) => {
                if (err) throw err

                rows.forEach(row => {
                    const event = client.events.find(e=> e.id === row.eventID)
                    const eventParticipant = new client.EventParticipant(event, new client.Player(row.discordID, row.minecraftUUID), true)
                    eventParticipant.setJoin(new Date(row.joinDate))
                    event.participants.push(eventParticipant)
                })
                return client.events
            })
        })
    }
    client.fetchEvents()

    client.fetchPlayers = async () => {
        client.db.all(`SELECT * FROM registry`, (err, rows) => {
            if (err) throw err

            rows.forEach(row => {
                client.newPlayer(row.discordID, row.minecraftUUID, true)
            })
            return client.players
        })
    }
    client.fetchPlayers()

    client.fetchSettings = async () => {
        client.db.all(`SELECT * FROM settings`, (err, rows) => {
            if (err) throw err

            client.settings = rows[0]
            return rows[0]
        })
    }
    client.fetchSettings()

    client.getUUID = (ID) => {
        return new Promise((resolve, reject) => {
            client.db.all("SELECT * FROM registry WHERE discordID = $ID", {$ID: ID}, (err, out) => {
                if (err) {
                    client.error(err)
                    reject(err)
                    return
                }
                if (!out || out.length < 1) {
                    resolve(null)
                    return
                }
                resolve(out[0].minecraftUUID)
            })
        })
    }

    client.getID = (UUID) => {
        return new Promise((resolve, reject) => {
            client.db.all("SELECT * FROM registry WHERE minecraftUUID = $UUID", {$UUID: UUID}, (err, out) => {
                if (err) {
                    client.error(err)
                    reject(err)
                    return
                }
                if (!out || out.length < 1) {
                    resolve(null)
                    return
                }
                resolve(out[0].discordID)
            })
        })
    }

    client.deleteUser = (provided) => {
        return new Promise((resolve, reject) => {
            client.db.all("DELETE FROM registry WHERE minecraftUUID = $UUID OR discordID = $ID", {$UUID: provided, $ID: provided}, (err, out) => {
                if (err) {
                    client.error(err)
                    reject(err)
                    return
                }
                resolve(out)
            })
        })
    }

}