const fs = require("fs")
exports.load = (client, reload) => {
    return new Promise (resolve => {
        if (reload) {
            delete client.commandManager
        }
        client.commandManager = {}
        client.commandManager.commands = new Map()
        client.commandManager.aliases = new Map()
        let loaded = []
        fs.readdir("./commands", (err, files) => { // LOAD DEFAULT COMMANDS
            if (err) {
                throw err
            }
            files.forEach(folder => {
                fs.readdir(`./commands/${folder}/`, (err, files) => {
                    if (err) throw err
                    files.forEach(folder2 => {
                        fs.readdir(`./commands/${folder}/${folder2}`, (err, files) => {
                            if (err) throw err
                            files.forEach(file => {
                                if (!file.endsWith(".js")) return
                                if (reload && require.cache[require.resolve(`../commands/${folder}/${folder2}/${file}`)]) {
                                    delete require.cache[require.resolve(`../commands/${folder}/${folder2}/${file}`)]
                                }
                                const content = require(`../commands/${folder}/${folder2}/${file}`)
                                const commandName = file.split(".")[0]
                                client.commandManager.commands.set(commandName, content)
                                loaded.push(commandName)
                                if (content.info) {
                                    content.info.name = commandName
                                    content.info.category = folder
                                    content.info.subcategory = folder2
                                    if (!content.info.aliases || content.info.aliases.length < 1) return
                                    content.info.aliases.forEach(alias => {
                                        client.commandManager.aliases.set(alias, commandName)
                                    })
                                } else {
                                    client.error(`${commandName} command does not have a help section.`)
                                }
                            })
                            console.log("Loaded commands:", loaded)

                            if (reload) {
                                client.removeAllListeners()
                                delete client.events
                            }
                            client.events = new Map()
                            fs.readdir("./events", (err, files) => { // LOAD DEFAULT EVENTS
                                let loadedEvents = []
                                if (err) return console.error(err);
                                files.forEach(file => {
                                    if (reload && require.cache[require.resolve(`../events/${file}`)]) {
                                        delete require.cache[require.resolve(`../events/${file}`)]
                                    }
                                    const event = require(`../events/${file}`);
                                    let eventName = file.split(".")[0];
                                    client.events.set(eventName, event)
                                    loadedEvents.push(eventName)
                                    client.on(eventName, event.bind(null, client))
                                });
                                console.log("Events loaded:", loadedEvents)
                                resolve()
                            });
                        })
                    })
                })
            })
        })
    })
}