exports.info = {
    info: "Does this even work?",
    format: "",
    aliases: [],
    hidden: false
}

const whitelist = ["337266897458429956", "236902502254116864"]

let lastSearch = null

const { SmartSearch } = require("../../../EventsAPI")

exports.run = async (client, message, args) => {
    if (whitelist.includes(message.author.id)) {
        if (lastSearch && (new Date() - lastSearch) / 60000 < 5) {
            return message.channel.send("This command was already run not long ago, please slow down")
        }
        lastSearch = new Date().getTime()

        const search = new SmartSearch(client)

        search.globalSearch()

        const m = await message.channel.send(search.embed)
        let interval = setInterval(() => {
            m.edit(search.embed)
            
            if (search.finished || search.stopped) {
                clearInterval(interval)
            }
        }, 2000)

    }
}