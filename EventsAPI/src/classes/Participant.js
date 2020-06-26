class Participant {
    /**
     * 
     * @param {ParticipantManager} manager 
     * @param {Player} player 
     */
    constructor(manager, player) {
        this.manager = manager
        this.event = manager.event
        this.client = manager.client
        this.player = player
        this.team = 1
    }

    remove() {
        this.manager.remove(this.player)
    }

    setTeam(number) {
        this.team = number
    }

    write() {
        return new Promise((resolve, reject) => {
            this.client.db.all(`SELECT * FROM participants WHERE id = $id AND discord = $discord`, {
                $id: this.event.id,
                $discord: this.player.discord
            }, (err, rows) => {
                if (err) {
                    reject(err)
                    return
                }
                if (rows.length < 1) {
                    this.client.db.all(`INSERT INTO participants(id, discord, minecraft, team) VALUES($id, $discord, $minecraft, $team)`, {
                        $id: this.event.id,
                        $discord: this.player.discord,
                        $minecraft: this.player.minecraft,
                        $team: this.team
                    }, (err) => {
                        if (err) {
                            reject(err)
                            return
                        }
                        resolve(this)
                    })
                } else {
                    this.client.db.all(`UPDATE participants SET discord = $discord, minecraft = $minecraft, team = $team WHERE id = $id`, {
                        $id: this.event.id,
                        $discord: this.player.discord,
                        $minecraft: this.player.minecraft,
                        $team: this.team
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

module.exports = Participant