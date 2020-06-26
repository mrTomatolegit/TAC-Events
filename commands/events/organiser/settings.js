const { MessageEmbed, MessageCollector } = require("discord.js")

exports.info = {
    info: "Settings for the bot smh",
	format: "[setting]",
	aliases: ["options"],
	hidden: false
}


exports.run = (client, message, [setting]) => {
    if (!message.member.roles.cache.find(r => r.id === client.settings.organiser)) {
        message.channel.send("You must be the event manager to do this!")
        return
    }
    const settings = {
        announcements: {
            description: "The id of the announcements channel",
            type: "channel id"
        },
        manager: {
            description: "The id of the event manager role",
            type: "channel id"
        }
    }
    if (setting) {
        setting = setting.toLowerCase()
        if (settings[setting]) {
            const collector = new MessageCollector(message.channel, m => m.author.id === message.author.id, {max: 1})
            message.channel.send(`What should ${setting} be? (${settings[setting].type})`)
            collector.on("collect", m => {
                if (settings[setting].type === "channel id") {
                    const channelRegex = new RegExp(/^[0-9]{18}$/)
                    if (!channelRegex.test(m.content)) {
                        m.channel.send("That isn't a channel id?")
                        return
                    }
                    client.settings[setting] = m.content
                    client.db.all(`UPDATE settings SET ${setting} = $value`, {$value: m.content}, (err, rows) => {
                        if (err) message.channel.send(err.message)
                        message.channel.send(`${setting} was set to ${m.content}`)
                    })
                }
            })
        } else {
            let embed = new MessageEmbed()
            .setTitle("Settings")
            .setColor("RANDOM")
            .setTimestamp()
            .setFooter(message.guild.name, message.guild.iconURL())
            for (let setting in settings) {
                embed = embed.addField(setting, settings[setting].description)
            }
            message.channel.send(embed)
        }
    } else {
        let embed = new MessageEmbed()
        .setTitle("Settings")
        .setColor("RANDOM")
        .setTimestamp()
        .setFooter(message.guild.name, message.guild.iconURL())
        for (let setting in settings) {
            embed = embed.addField(setting, settings[setting].description)
        }
        message.channel.send(embed)
    }
}