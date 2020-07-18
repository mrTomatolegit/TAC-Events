const { PlayerUpdater } = require("../../../EventsAPI")

exports.info = {
    info: "Does this even work?",
    format: "",
    aliases: [],
    hidden: false
}

const whitelist = ["337266897458429956", "236902502254116864"]

exports.run = async (client, message, args) => {
    if (whitelist.includes(message.author.id)) {
        const playerUpdater = new PlayerUpdater(client)
        playerUpdater.updateAll()
        const m = await message.channel.send(playerUpdater.embed)
        let interval = setInterval(() => {
            m.edit(playerUpdater.embed)
            if (playerUpdater.finished) {
                clearInterval(interval)
            }
        }, 2000)
    }
}