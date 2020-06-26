

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
    if (m3content.toLowerCase().includes("pm")) {
        date.setUTCHours(date.getUTCHours() + 12)
    }
    return date
}

exports.run = (client, message, args) => {
    if (!message.member.roles.cache.find(r => r.id === client.settings.organiser)) {
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
            const event = client.events.create()
            event.setName(eventName)
            event.setOrganiser(message.author.id)
            message.channel.send(`Event with the name \`${event.name}\` was created, when should it be? DD/MM/YY HH:MN (am or pm)  or  "null"\nDate must be in GMT (UTC)`).then(m2 => {
                m2.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1}).then(m3 => {
                    m3 = m3.first()
                    const foundDate = findDate(m3.content)
                    if (foundDate < new Date()) {
                        message.channel.send("The date you gave me is inferior to our time now... but ok :p")
                    }
                    event.setDate(foundDate)
                    message.channel.send(`Date was set to \`${event.date ? event.date.toUTCString() : null}\`, how many participants can there be? any number or "null"`).then(m4 => {
                        m4.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1}).then(m => {
                            m = m.first()
                            if (!isNaN(m.content)) {
                                event.setMax(parseInt(m.content))
                            }
                            event.write()
                            message.channel.send(`Max participants was set as \`${event.max}\`, you can edit your event with \`${client.config.prefix}editevent\``)
                        })
                    })
                })
            })
        })
    })
}