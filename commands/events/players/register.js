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

    const registeredID = client.players.get(message.author.id)
    if (registeredID != null) {
        message.channel.send(`Your account is already registered as \`${await client.mojang.getName(registeredID)}\`!\nIf you believe this is an error please contact a staff member`)
        return
    }

    const uuid = await client.mojang.getUUID(IGN)
    if (uuid == null) {
        message.channel.send(`I could not find ${IGN} in mojang's api`)
        return
    }

    const registeredUUID = client.players.find(p => p.minecraft === uuid)
    if (registeredUUID != null) {
        message.channel.send(`The IGN \`${await client.mojang.getName(uuid)}\` is already registered!\nIf you believe this is an error please contact a staff member`)
        return
    }

    client.keymanager.next().getPlayer(uuid).then(hypixelPlayer => {
        if (!hypixelPlayer || !hypixelPlayer.socialMedia || !hypixelPlayer.socialMedia.links) {
            message.channel.send("Please link your Discord account with your in-game account. If you cannot or don't understand, ask a staff member for assistance.")
            return
        }
        const tag = hypixelPlayer.socialMedia.links.DISCORD
        if (!tag) {
            message.channel.send("Please link your Discord account with your in-game account. If you cannot or don't understand, ask a staff member for assistance.")
            return
        } else
        if (message.author.tag !== tag) {
            message.channel.send("The Discord tag associated with this player is not the same as your current tag")
            return
        }

        const player = client.players.add(message.author.id, uuid)

        player.write().then(async () => {
            message.channel.send(`Success! Your discord account is now linked to \`${IGN}\``)
            message.member.setNickname(hypixelPlayer.displayName)
        }).catch(e => {
            message.channel.send("Your name is correct... but there was an error on our side. Try again later?")
            client.error(e)
        })
    }).catch((e) => {
        message.channel.send("There was an error with Hypixel! oops...")
        client.error(e)
    })
}