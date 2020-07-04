exports.info = {
    info: "Does this even work?",
    format: "<Role ID> <...Guild Name>",
    aliases: [],
    hidden: false
}

const whitelist = ["337266897458429956", "236902502254116864"]

exports.run = async (client, message, [roleID, ...guildName]) => {
    if (whitelist.includes(message.author.id)) {
        if (!roleID || !guildName || guildName.length < 2) {
            message.channel.send("Missing arguments, check the help command")
            return
        }
        const roleRegex = new RegExp(/[0-9]{18}/)
        const finds = roleID.match(roleRegex)
        if (!finds || finds.length < 1) {
            message.channel.send("That isnt a role id!")
            return
        }
        const role = message.guild.roles.cache.get(finds[0])
        if (!role) {
            message.channel.send("I could not find that role here!")
            return
        }
        const guildID = await client.keymanager.next().findGuildByName(guildName.join(" "))
        if (!guildID) {
            message.channel.send("Hypixel could not find the guild name `" + guildName.join(" ") + "`")
            return
        }
        client.hypixelGuilds.add(guildID).setRole(role.id).write().then(() => {
            message.channel.send(`Role \`${role.name}\` was registered as \`${guildID}\``)
            return
        })
    }
}