exports.info = {
    info: "Creates a new event",
    format: "<Event name>",
    aliases: ["newevent"],
    hidden: false
}

const findDate = (m3content) => {
    const dateRegex = new RegExp(/[0-9]{1,2}/g)
    const finds = m3content.match(dateRegex)
    if (!finds || finds.length < 5) {
        return null
    }
    finds.forEach((find, index) => {
        finds[index] = parseInt(find)
    })
    const date = new Date()
    date.setUTCDate(finds[0])
    date.setUTCMonth(finds[1] - 1)
    date.setUTCFullYear(eval(`20${finds[2]}`))
    date.setUTCHours(finds[3])
    date.setUTCMinutes(finds[4])
    date.setUTCSeconds(0)
    date.setUTCMilliseconds(0)
    return date
}

exports.run = (client, message, args) => {
    if (!message.member.roles.cache.find(r => r.id === client.settings.manager)) {
        message.channel.send("You must be the event manager to do this!")
        return
    }
    const eventName = args.join(" ")
    if (eventName.length < 1) {
        message.channel.send("Invalid event name `" + (eventName || null) + '`')
        return
    }
    message.channel.send(`Are you sure you would like to create an event with the name \`${eventName}\``).then(async m => {
        await m.react("✅")
        await m.react("❌")
        m.awaitReactions((r, u) => u.id === message.author.id, {max: 1}).then((reaction) => {
            if (reaction.first().emoji.name !== "✅") {
                message.channel.send("Event creation canceled")
                return
            }
            const event = client.newEvent(eventName, null, message.author.id)
            message.channel.send(`Event with the name \`${event.name}\` was created, when should it be? DD/MM/YY HH:MN (GMT)  or  "null"`).then(m2 => {
                m2.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1}).then(m3 => {
                    m3 = m3.first()
                    console.log(m3.content)
                    const foundDate = findDate(m3.content)
                    event.setDate(foundDate)
                    message.channel.send(`Date was set to \`${event.date ? event.date.toUTCString() : null}\`, how many participants can there be? any number or "null"`).then(m4 => {
                        m4.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1}).then(m => {
                            m = m.first()
                            console.log(m.content)
                            if (!isNaN(m.content)) {
                                event.setMax(parseInt(m.content))
                            }
                            event.writeE()
                            message.channel.send(`Max participants was set as \`${event.max}\`, you can edit your event with \`${client.config.prefix}editevent\``)
                        })
                    })
                })
            })
        })
    })
}