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
            files.forEach((folder, index1, array1) => {
                fs.readdir(`./commands/${folder}/`, (err, files) => {
                    if (err) throw err
                    files.forEach((folder2, index2, array2) => {
                        fs.readdir(`./commands/${folder}/${folder2}`, (err, files) => {
                            if (err) throw err
                            files.forEach((file, index3, array3) => {
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
                                    if (content.info.aliases || content.info.aliases.length > 0) {
                                        content.info.aliases.forEach(alias => {
                                            client.commandManager.aliases.set(alias, commandName)
                                        })
                                    }
                                } else {
                                    client.error(`${commandName} command does not have a help section.`)
                                }
                                if (index1 === array1.length-1 && index2 === array2.length-1 && index3 === array3.length-1) {
                                    console.log("Loaded commands:", loaded)
                                }
                            })
                        })
                    })
                })
            })
            if (reload) {
                client.removeAllListeners()
            }
            fs.readdir("./events", (err, files) => { // LOAD DEFAULT EVENTS
                let loadedEvents = []
                if (err) return console.error(err);
                files.forEach(file => {
                    if (reload && require.cache[require.resolve(`../events/${file}`)]) {
                        delete require.cache[require.resolve(`../events/${file}`)]
                    }
                    const event = require(`../events/${file}`);
                    let eventName = file.split(".")[0];
                    loadedEvents.push(eventName)
                    client.on(eventName, event.bind(null, client))
                });
                console.log("Events loaded:", loadedEvents)
                resolve()
            });
        })
    })
}