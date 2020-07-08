exports.info = {
    info: "Registers a user tag by \"force\"",
	format: "<minecraft ign> <discord tag>",
	aliases: [],
	hidden: false
}

const tacGuild = "617635094106210316"

exports.run = async (client, message, [minecraft, ...discord]) => {
    discord = discord.join(" ")
    if (!message.member.roles.cache.find(r => r.id === client.settings.organiser)) {
        message.channel.send("You must be the event manager to do this!")
        return
    }

    const user = client.users.cache.find(u => u.tag.toLowerCase() === discord.toLowerCase()) || client.users.cache.find(u => u.id === discord)
    const mc = await client.mojang.getUUID(minecraft)

    if (!user) {
        message.channel.send("That's not a tag/id!")
        return
    }

    if (!mc) {
        message.channel.send("That's not a minecraft ign!")
        return
    }

    const tac = client.guilds.cache.get(tacGuild)
    const tacMember  = tac.members.cache.get(user.id)
    if (tacMember) tacMember.setNickname(await client.mojang.getName(mc))
    if (tacMember) {
        tacMember.roles.add("730086771198525482")
        const memberGuildID = await client.keymanager.next().findGuildByPlayer(mc)
        if (client.hypixelGuilds.get(memberGuildID)) {
            tacMember.roles.add(client.hypixelGuilds.get(memberGuildID).role).catch(() => {})
        }
    }
    client.players.add(user.id, mc).write().then(() => {
        message.channel.send("ok")
    })
}