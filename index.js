require('dotenv').config()
const Discord = require("discord.js");
const EventsAPI = require("./EventsAPI")
const client = new Discord.Client();
const sqlite = require("sqlite3")
client.db = new sqlite.Database("./EventsAPI/src/client/TACEvents.db")
client.events = new EventsAPI.EventManager(client)
client.players = new EventsAPI.PlayerManager(client)
client.settings = new EventsAPI.SettingsManager(client)
client.announcements = new EventsAPI.AnnounceManager(client)
client.hypixelGuilds = new EventsAPI.GuildManager(client)

const fs = require("fs");
client.start = (reload) => {
    const owo = new Promise(resolve => {
        if (reload) {
            delete client.boot
        }
        fs.readdir("./boot", (err, files) => {
            if (err) {
                throw err
            }
            client.boot = {}
            files.forEach(async file => {
                if (file.endsWith(".js")) {
                    let functionName = file.split(".")[0]
                    if (reload && require.cache[require.resolve(`./boot/${file}`)]) {
                        delete require.cache[require.resolve(`./boot/${file}`)]
                    }
                    client.boot[functionName] = require(`./boot/${file}`)
                    await client.boot[functionName].load(client, reload)
                }
            })
            if (reload) {
                resolve("All scripts reloaded successfully")
            } else {
                resolve("Loading was successful")
            }
        })
    })
    return owo
}
client.start().then(o => {
    console.log(o)
}).catch(e => {
    console.error(e)
})

const logs = fs.createWriteStream("./data/logs.log", "utf8")
client.log = (text) => {
    console.log(text)
    const date = new Date()
    const dateFormat = `${date.getUTCDate()}-${date.getUTCMonth()+1}-${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}.${date.getUTCMilliseconds()}`
    logs.write(`\n\n[${dateFormat}] ${text}`)
}

const errors = fs.createWriteStream("./data/errors.log")
client.error = (text) => {
    console.error(text.stack || text)
    const date = new Date()
    const dateFormat = `${date.getUTCDate()}-${date.getUTCMonth()+1}-${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}.${date.getUTCMilliseconds()}`
    logs.write(`\n\n[${dateFormat}] ${text.stack || text}`)
    errors.write(`\n\n[${dateFormat}] ${text.stack || text}`)
}

process.on("beforeExit", async () => {
    client.destroy()
})

client.login(process.env.token)