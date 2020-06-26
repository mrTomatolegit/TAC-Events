const ParticipantManager = require("../managers/ParticipantManager")
const Discord = require("discord.js")
const schedule = require("node-schedule")
const Client = require("../client/Client")

class Event {
    /**
     * 
     * @param {Client} client 
     * @param {number} id 
     */
    constructor(client, id) {
        this.client = client
        this.name = ""
        this.id = id
        this.participants = new ParticipantManager(this)
        this.max = null
        this.date = null
        this.job = undefined
        this.organiser = null
        this.teams = 1
    }

    /**
     * 
     * @param {string} name 
     */
    setName(name) {
        this.name = name
        return this
    }

    /**
     * 
     * @param {number} int 
     */
    setTeams(int) {
        this.teams = int
        return this
    }

    /**
     * 
     * @param {string} organiser 
     */
    setOrganiser(organiser) {
        this.organiser = organiser
        return this
    }
    /**
     * @returns {Date}
     */
    get announceDate() {
        if (this.date) {
            const date = new Date(this.date.getTime())
            date.setMinutes(date.getMinutes() - 10)
            console.log("aaa")
            return date
        } else {
            return null
        }
    }

    /**
     * 
     * @param {Date} date 
     */
    setDate(date) {
        this.date = date
        if (this.date) {
            if (this.job) {
                this.job.cancel()
            }
            console.log(this.announceDate)
            this.job = schedule.scheduleJob(this.name, this.announceDate, () => {
                this.announce()
            })
            console.log("job", this.job)
        }
        return this
    }

    /**
     * 
     * @param {number} max 
     */
    setMax(max) {
        this.max = max
        return this
    }

    /**
     * @returns {boolean}
     */
    get canJoin() {
        const date = new Date()
        date.setMinutes(date.getMinutes() + 12)
        return (this.date ? this.date > date : false) && (this.max ? this.participants.size < this.max : true)
    }

    announce() {
        const organiser = this.organiser ? this.client.users.cache.get(this.organiser) : this.organiser
        let left
        let right
        let pings
        new Promise((resolve) => {
            if (this.participants.size > 0) {
                this.participants.forEach(async (p, index, map) => {
                    p.player.getIGN().then(IGN => {
                        left = `${left || ""}${p.player.user}\n`
                        right = `${right || ""}${IGN}`
                        pings = `${pings || ""} ${p.player.user}`
                        if (index === map.last().player.discord) resolve()
                    })
                })
            } else {
                resolve()
            }
        }).then(() => {
            const embed = new Discord.MessageEmbed()
            .setTitle(this.name)
            .setDescription(`${this.name} starts ` + (this.date? `in ${Math.ceil((this.date.getTime() - new Date().getTime())/60000)} minutes` : "soon") + `, all below players should get ready`)
            .addField("Organiser", organiser)
            .addField("Discord users", left || "No one registered", true)
            .addField("Minecraft IGNs", right || "No one registered", true)
            .setColor("RANDOM")
            .setTimestamp(this.date)
            .setFooter("Event starts")
            this.client.announcements.forEach(announce => {
                const announChannel = announce.channel
                if (!announChannel) return
                pings = `||${organiser}, ${pings ? pings.trim() : "no participants to ping!"}${announce.role ? `, <@&${announce.role.id}>` : ""}||`
                announChannel.send({embed}).then(() => {
                    announChannel.send(pings)
                    if (this.date) {
                        setTimeout(() => {
                            announChannel.send(`${this.name} has started!`)
                        }, this.date.getTime() - new Date().getTime())
                    }
                })
            })
        })
    }

    write() {
        return new Promise((resolve, reject) => {
            this.client.db.all(`SELECT * FROM events WHERE id = $id`, {
                $id: this.id
            }, (err, rows) => {
                if (err) {
                    reject(err)
                    return
                }
                console.log(rows)
                if (rows.length < 1) {
                    this.client.db.all(`INSERT INTO events(id, name, organiser, max, teams, date) VALUES($id, $name, $organiser, $max, $teams, $date)`, {
                        $id: this.id,
                        $name: this.name,
                        $organiser: this.organiser,
                        $max: this.max,
                        $teams: this.teams,
                        $date: this.date ? this.date.getTime() : null
                    }, (err) => {
                        if (err) {
                            reject(err)
                            return
                        }
                        resolve(this)
                    })
                } else {
                    this.client.db.all(`UPDATE events SET name = $name, organiser = $organiser, max = $max, teams = $teams, date = $date WHERE id = $id`, {
                        $id: this.id,
                        $name: this.name,
                        $organiser: this.organiser,
                        $max: this.max,
                        $teams: this.teams,
                        $date: this.date ? this.date.getTime() : null
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

module.exports = Event