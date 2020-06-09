exports.info = {
    info: "Attemps to reinitialize the bot from scratch",
    format: "",
    aliases: [],
    hidden: true
}

exports.run = (client, message, args) => {
    if (message.author.id !== client.config.creatorID) return
    client.start(true).then(o => {
        message.channel.send(o)
        const readyEvent = client.events.get("ready")
        readyEvent(client)
        console.log(o)
    }).catch(e => {
        message.channel.send(e.message || e)
        console.error(e.message || e)
    })
}