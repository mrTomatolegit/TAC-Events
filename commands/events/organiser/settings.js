const { MessageEmbed, MessageCollector } = require("discord.js")

exports.info = {
    info: "Settings for the bot smh",
	format: "[setting]",
	aliases: ["options"],
	hidden: false
}

const whitelist = ["337266897458429956", "236902502254116864"]

exports.run = (client, message, [setting]) => {
    if (!message.member.roles.cache.find(r => r.id === client.settings.organiser) && !whitelist.includes(message.author.id)) {
        message.channel.send("You must be the event manager to do this!")
        return
    }
    const settings = {
        organiser: {
            description: "The id of the event organiser role",
            type: "role id"
        }
    }
    if (setting) {
        setting = setting.toLowerCase()
        if (settings[setting]) {
            const collector = new MessageCollector(message.channel, m => m.author.id === message.author.id, {max: 1})
            message.channel.send(`What should ${setting} be? (${settings[setting].type})`)
            collector.on("collect", m => {
                if (settings[setting].type === "channel id") {
                    const channelRegex = new RegExp(/[0-9]{18}/)
                    const finds = m.content.match(channelRegex)
                    if (!finds || finds.length < 1) {
                        m.channel.send("That isn't a channel id?")
                        return
                    } else {
                        m.content = finds[0]
                    }
                    client.settings[setting] = m.content
                    client.settings.write().then(() => {
                        message.channel.send(`${setting} was set to ${client.settings[setting]}`)
                    })
                } else 
                if (settings[setting].type === "role id") {
                    const roleRegex = new RegExp(/[0-9]{18}/)
                    const finds = m.content.match(roleRegex)
                    if (!finds || finds.length < 1) {
                        m.channel.send("That isn't a role id?")
                        return
                    } else {
                        m.content = finds[0]
                    }
                    client.settings[setting] = m.content
                    client.settings.write().then(() => {
                        message.channel.send(`${setting} was set to ${client.settings[setting]}`)
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