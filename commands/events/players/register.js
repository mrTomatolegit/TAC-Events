exports.info = {
    info: "Registers your IGN into the database",
    format: "<Minecraft IGN>",
    aliases: ["reg"],
    hidden: false
}

exports.run = async (client, message, [IGN]) => {
    if (!IGN) {
        message.reply("You need to specify your ign")
        return
    }

    const registeredID = await client.getUUID(message.author.id)

    if (registeredID != null) {
        message.channel.send(`Your account is already registered as \`${await client.mojang.getName(registeredID)}\`!\nIf you believe this is an error please contact a staff member`)
        return
    }


    const uuid = await client.mojang.getUUID(IGN)

    if (uuid == null) {
        message.channel.send(`I could not find ${IGN} in mojang's api`)
        return
    }

    const registeredUUID = await client.getID(uuid)

    if (registeredUUID != null) {
        message.channel.send(`The IGN \`${await client.mojang.getName(uuid)}\` is already registered!\nIf you believe this is an error please contact a staff member`)
        return
    }
    const player = client.newPlayer(message.author.id, uuid)

    player.write().then(async () => {
        message.channel.send(`Success! Your discord account is now linked to \`${IGN}\``)
        message.member.setNickname(await client.mojang.getName(uuid)).catch(() => {})
    }).catch((e) => {
        message.channel.send(e.message || e)
    })

}