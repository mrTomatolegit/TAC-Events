exports.info = {
    info: "Registers a user tag by \"force\"",
	format: "<discord tag> <minecraft ign>",
	aliases: ["options"],
	hidden: false
}

const tacGuild = "617635094106210316"

exports.run = async (client, message, [discord, minecraft]) => {
    
    if (!message.member.roles.cache.find(r => r.id === client.settings.organiser)) {
        message.channel.send("You must be the event manager to do this!")
        return
    }

    const user = client.users.cache.find(u => u.tag.toLowerCase() === discord.toLowerCase())
    const mc = await client.mojang.getUUID(minecraft)

    if (!user) {
        message.channel.send("That's not a tag!")
        return
    }

    if (!mc) {
        message.channel.send("That's not a minecraft ign!")
        return
    }

    const tac = client.guilds.cache.get(tacGuild)
    const member  = tac.members.cache.get(user.id)
    if (member) member.setNickname(await client.mojang.getName(mc))

    client.players.add(user.id, mc).write().then(() => {
        message.channel.send("ok")
    })
}