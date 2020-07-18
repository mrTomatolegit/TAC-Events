exports.info = {
    info: "Does this even work?",
    format: "",
    aliases: [],
    hidden: false
}

const whitelist = ["337266897458429956", "236902502254116864"]

exports.run = (client, message, args) => {
    if (whitelist.includes(message.author.id)) {
        client.boot.updateInterval.update().then(() => {
            message.channel.send("ok")
        })
    }
}