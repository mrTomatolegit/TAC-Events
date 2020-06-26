const Participant = require("../classes/Participant")
const Player = require("../classes/Player")
const {Collection} = require("discord.js")

class ParticipantManager extends Collection {
    /**
     * 
     * @param {Event} event 
     */
    constructor(event) {
        super()
        this.event = event
        this.client = event.client
    }
    
    /**
     * 
     * @param {Player} player 
     */
    add(player) {
        this.set(player.discord, new Participant(this, player))
        return this.get(player.discord)
    }

    /**
     * 
     * @param {Player} player 
     */
    remove(player) {
        this.delete(player.discord)
        this.client.db.all(`DELETE FROM participants WHERE id = $id AND discord = $discord`, {
            $id: this.event.id,
            $discord: player.discord
        }, (err) => {
            if (err) {
                this.client.error(err)
            }
        })
    }

    fetch() {
        return new Promise((resolve, reject) => {
            this.client.db.all(`SELECT * FROM participants WHERE id = $id`, {$id: this.event.id}, (err, rows) => {
                if (err) {
                    reject(err)
                    return
                }
                rows.forEach(row => {
                    const player = this.client.players.get(row.discord)
                    if (!player) return
                    this.add(player)
                })
                resolve(this)
            })
        })
    }
}

module.exports = ParticipantManager