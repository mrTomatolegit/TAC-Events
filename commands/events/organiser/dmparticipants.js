exports.info = {
    info: "DMs all the participants ",
    format: "[Event ID]",
    aliases: ["dmparts"],
    hidden: false
}

const Discord = require('discord.js')

exports.run = (client, message, [eventID]) => {

    if (!message.member.roles.cache.find(r => r.id === client.settings.organiser)) {
        message.channel.send("You must be the event manager to do this!")
        return
    }

    const event = client.events.get(parseInt(eventID)) || client.events.find(e => e.canJoin == true)
    if (!event) {
        message.channel.send("No event found")
        return
    }
    const participants = event.participants

    if (!participants || participants.size < 1) {
        message.channel.send("I couldn't find any participants")
        return
    }

    message.channel.send("What would you like to send?").then(m => {
        m.channel.awaitMessages(m => m.author.id === message.author.id, {
            max: 1,
            time: 120000
        }).then(collected => {
            const text = collected.first().content
            if (text.length < 6) {
                message.channel.send("Message too short")
                return
            }
            const embed = new Discord.MessageEmbed()
                .setAuthor(message.author.tag + " (TAC events manager)", message.author.avatarURL())
                .setDescription(text)
                .addField("Event name", event.name, true)
                .addField("Event ID", event.id, true)
                .setColor("RANDOM")
                .setFooter("Event date")
                .setTimestamp(event.date)
            let succeeded = []
            let failures = []
            const successPercentage = () => {
                let total = succeeded.length + failures.length
                return succeeded.length * 100 / total
            }
            const stats = () => {
                message.channel.send(new Discord.MessageEmbed()
                    .setTitle("DM all stats")
                    .setDescription("The failed users have their DMs locked, this is a 'problem' on their side")
                    .addField("Succeeded", succeeded.join("\n") || "No succeeds", true)
                    .addField("Failures", failures.join("\n") || "No failures", true)
                    .setColor("RANDOM")
                    .setFooter(`Success rate: ${successPercentage()}%`)
                )
            }
            participants.forEach((p, index, array) => {
                p.player.user.send(embed).then(() => {
                    succeeded.push(p.player.user)
                    if (index === array.last().player.discord) {
                        stats()
                    }
                }).catch((e) => {
                    console.error(e)
                    failures.push(p.player.user)
                    if (index === array.last().player.discord) {
                        stats()
                    }
                })
            })
        })
    })
}