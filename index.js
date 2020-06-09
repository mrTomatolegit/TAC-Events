require('dotenv').config()
const Discord = require("discord.js");
const client = new Discord.Client();

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

client.log = (text) => {
    console.log(text)
    fs.readFile("./data/logs.log", "utf8", (err, content) => {
        if (err) {
            console.error(err)
            return false
        }
        const date = new Date()
        const dateFormat = `${date.getUTCDate()}-${date.getUTCMonth()+1}-${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}.${date.getUTCMilliseconds()}`
        const finished = `[${dateFormat}] ${text}\n\n${content}`.substr(0, 100000)
        fs.writeFile("./data/logs.log", finished, "utf8", (err) => {
            if (err) {
                console.error(err)
                return false
            }
            return true
        })
    })
}
client.error = (text) => {
    console.error(text.stack || text)
    fs.readFile("./data/logs.log", "utf8", (err, content) => {
        if (err) {
            console.error(err)
            return false
        }
        const date = new Date()
        const dateFormat = `${date.getUTCDate()}-${date.getUTCMonth()+1}-${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}.${date.getUTCMilliseconds()}`
        const finished = `[${dateFormat}] ${text.stack || text}\n\n${content}`.substr(0, 100000)
        fs.writeFile("./data/logs.log", finished, "utf8", (err) => {
            if (err) {
                console.error(err.stack || err)
                return false
            }
            return true
        })
    })
    fs.readFile("./data/errors.log", "utf8", (err, content) => {
        if (err) {
            console.error(err)
            return false
        }
        const date = new Date()
        const dateFormat = `${date.getUTCDate()}-${date.getUTCMonth()+1}-${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}.${date.getUTCMilliseconds()}`
        const finished = `[${dateFormat}] ${text.stack || text}\n\n${content}`.substr(0, 100000)
        fs.writeFile("./data/errors.log", finished, "utf8", (err) => {
            if (err) {
                console.error(err.stack || err)
                return false
            }
            return true
        })
    })
    client.channels.cache.get("705373055689424896").send(`<@337266897458429956>, ${text.message || text}`)
}

process.on("beforeExit", async (code) => {
    client.destroy()
    client.log("Process exited with code " + code)
})

client.login(process.env.token)