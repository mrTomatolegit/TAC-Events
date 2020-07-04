exports.info = {
    info: "Does this even work?",
    format: "",
    aliases: [],
    hidden: false
}

const whitelist = ["337266897458429956", "236902502254116864"]
const { MessageEmbed } = require("discord.js")

exports.run = (client, message, args) => {
    if (whitelist.includes(message.author.id)) {
        client.boot.nicknameUpdateInterval.updateNicknames().then(updated => {
            message.channel.send(new MessageEmbed()
                .setTitle("New nicknames")
                .setDescription(`\`\`\`${updated.join("\n") || "No nicknames updated"}\`\`\``)
                .setColor("RANDOM")
                .setTimestamp()
                .setFooter(`${updated.length} members' nicknames were updated`)
            )
        })
    }
}