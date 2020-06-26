const { Client } = require("discord.js");

const EventManager = require("../managers/EventManager");
const sqlite = require("sqlite3");
const PlayerManager = require("../managers/PlayerManager");
const SettingsManager = require("../managers/SettingsManager");
const path = require("path")
const db = new sqlite.Database("./EventsAPI/src/client/TACEvents.db")

class NewClient extends Client{
    /**
     * 
     * @param {object} clientOptions 
     */
    constructor(clientOptions) {
        super(clientOptions)
        this.events = new EventManager(this)
        this.players = new PlayerManager(this)
        this.settings = new SettingsManager(this)
        this.db = db
    }

    init() {
        return new Promise((resolve, reject) => {
            this.players.fetch().then(() => {
                this.settings.fetch().then(() => {
                    this.events.fetch().then(events => {
                        events.forEach(event => {
                            event.participants.fetch().then(() => {
                                resolve()
                            }).catch(e => {
                                reject(e)
                            })
                        })
                    }).catch(e => {
                        reject(e)
                    })
                }).catch((e) =>{
                    reject(e)
                })
            }).catch((e) => {
                reject(e)
            })
        })
    }
}

module.exports = NewClient