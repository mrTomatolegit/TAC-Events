exports.info = {
    info: "Creates a new event",
    format: " <Event ID> <#channel> <Message ID>",
    aliases: [],
    hidden: false
}

const EventsAPI = require("../../../EventsAPI")

exports.run = async (client, message, [eventID, channelID, messageID]) => {
    if (!message.member.roles.cache.find(r => r.id === client.settings.organiser) && message.author.id !== "337266897458429956") {
        message.channel.send("You must be the event manager to do this!")
        return
    }
    let rchannel
    let rmessage

    const IDregex = new RegExp(/[0-9]{18}/)

    const channelFinds = channelID.match(IDregex)

    if (channelFinds && channelFinds.length > 0) {
        const channelID_ = channelFinds[0]
        const channel = message.guild.channels.cache.get(channelID_)

        if (!channel) {
            return message.channel.send("Invalid channel, does not exist")
        }

        rchannel = channel
    } else {
        message.channel.send("Invalid channel ID")
        return
    }

    const messageFinds = messageID.match(IDregex)

    if (messageFinds && messageFinds.length > 0) {
        const messageID_ = messageFinds[0]
        const msg = await rchannel.messages.fetch(messageID_)

        if (!msg) {
            return message.channel.send("Invalid message, does not exist")
        }

        rmessage = msg
    } else {
        message.channel.send("Invalid message ID")
        return
    }

    const event = client.events.get(parseInt(eventID))

    if (!event) {
        return message.channel.send("That event does not exist")
    }

    if (client.prms.get(rmessage.id)) {
        return message.channel.send("That message is already being reacted to")
    }

    rmessage.react("✅")

    client.prms.set(rmessage.id, new EventsAPI.ParticipationRM(client, {id: event.id, message: rmessage.id}))
    client.prms.get(rmessage.id).write().then(() => {
        message.channel.send("Success!")
    }).catch(() => {
        rmessage.reactions.removeAll()
    })
}