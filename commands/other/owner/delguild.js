exports.info = {
    info: "Does this even work?",
    format: "<Role ID | Guild Name>",
    aliases: [],
    hidden: false
}

const whitelist = ["337266897458429956", "236902502254116864"]

exports.run = async (client, message, args) => {
    if (whitelist.includes(message.author.id)) {
        if (!args) {
            message.channel.send("Missing arguments, check the help command")
            return
        }
        const input = args[0]
        const inputString = args.join(" ")
        let guildID
        let role
        if (input.length < 2) {
            message.channel.send("Missing arguments, check the help command")
            return
        }
        const roleRegex = new RegExp(/[0-9]{18}/)
        const finds = input.match(roleRegex)
        if (!finds || finds.length < 1) {
            guildID = await client.keymanager.next().findGuildByName(inputString)
            if (!guildID) {
                message.channel.send("Hypixel could not find the guild name `" + inputString + "`")
                return
            }
        } else {
            role = message.guild.roles.cache.get(finds[0])
            if (!role) {
                message.channel.send("I could not find that role here!")
                return
            }
        }
        const guild = client.hypixelGuilds.find(g => g.id === guildID || g.role ? g.role.id : true === role ? role.id : false)
        if (!guild) {
            message.channel.send("That role/guild isn't registered")
            return
        }
        guild.remove()
        message.channel.send("Guild was successfully removed")
    }
}