exports.info = {
    info: "Sets the channel where to announce events",
    format: "<#channel or \"remove\">",
    aliases: ["setannouncements", "setannounce"],
    hidden: false
}

exports.run = (client, message, [channelID]) => {
    if (!message.member.hasPermission("MANAGE_CHANNELS")) return
    if (!channelID) {
        message.channel.send('You need to provide a channel id or "remove"')
        return
    }
    const regex = new RegExp(/[0-9]{18}/)
    const finds = channelID.match(regex)
    if (!finds || finds.length < 1) {
        if (channelID.toLowerCase() === "remove") {
            const announce = client.announcements.get(message.guild.id)
            if (!announce) {
                message.channel.send("Announcement settings were never set")
                return
            }
            announce.delete()
            message.channel.send("Announcements channel was removed")
        } else {
            message.channel.send("You didn't give me a channel")
        }
        return
    }
    const channel = client.channels.cache.get(finds[0])
    if (!channel || !message.guild.channels.cache.get(channel.id)) {
        message.channel.send("I could not find that channel in your server")
        return
    }

    client.announcements.add(channel).write().then(() => {
        message.channel.send(`The channel ${channel} was set as the announcements channel`)
    })
}