const { Collection } = require("discord.js");
const ParticipationRM = require("../classes/ParticipationRM");

class ParticipationRMsManager extends Collection{
    constructor(client) {
        super()
        this.client = client
    }

    fetch() {
        return new Promise((resolve, reject) => {
            this.client.db.all(`SELECT * FROM participationRMs`, (err, rows) => {
                if (err) {return reject(err)}

                if (rows && rows.length > 0) {
                    rows.forEach(row => {
                        this.set(row.message, new ParticipationRM(this.client, row))
                    })
                }

                resolve(this)
            })
        })
    }
}

module.exports = ParticipationRMsManager