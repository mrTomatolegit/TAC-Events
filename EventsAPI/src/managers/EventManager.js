const {
    Client
} = require("../../index")
const Event = require("../classes/Event")
const {Collection} = require("discord.js")

class EventManager extends Collection {
    /**
     * 
     * @param {Client} client 
     */
    constructor(client) {
        super()
        this.client = client
    }

    /**
     * @returns {Promise<EventManager>}
     */
    fetch() {
        return new Promise((resolve, reject) => {
            this.client.db.all(`SELECT * FROM events`, (err, rows) => {
                if (err) {
                    reject(err)
                    return
                }
                if (rows.length < 1) {
                    resolve(this)
                    return
                }
                rows.forEach(row => {
                    const event = this.create(row.id)
                    event
                        .setName(row.name)
                        .setOrganiser(row.organiser)
                        .setTeams(row.teams)
                        if (row.date) {
                            event.setDate(new Date(row.date))
                        }
                })
                resolve(this)
            })
        })
    }

    get unusedID() {
        const aa = this.last()
        console.log(aa.id + 1)
        return aa ? aa.id + 1 : 1
    }

    create(id) {
        if (id) {
            const event = new Event(this.client, id)
            this.set(event.id, event)
            return event
        } else {
            const event = new Event(this.client, this.unusedID)
            this.set(event.id, event)
            return event
        }
    }
}

module.exports = EventManager