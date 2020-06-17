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

    client.keymanager.next().getPlayer(uuid).then(hypixelPlayer => {
        if (!hypixelPlayer) {
            message.channel.send('This name has never logged into Hypixel')
            return
        }
        if (!hypixelPlayer.socialMedia) {
            message.channel.send('This name does not have any social media')
            return
        }
        if (!hypixelPlayer.socialMedia.links) {
            message.channel.send("Please link your Discord account with your in-game account. If you cannot or don't understand, ask a staff member for assistance or view this message")
            return
        }
        const tag = hypixelPlayer.socialMedia.links.DISCORD
        if (!tag) {
            message.channel.send("Please link your Discord account with your in-game account. If you cannot or don't understand, ask a staff member for assistance or view this message")
            return
        } else
        if (message.author.tag !== tag) {
            message.channel.send("The Discord tag associated with this player is not the same as your current tag")
            return
        }

        const player = client.newPlayer(message.author.id, uuid)

        player.write().then(async () => {
            message.channel.send(`Success! Your discord account is now linked to \`${IGN}\``)
            message.member.setNickname(await client.mojang.getName(uuid)).catch(() => {})
        }).catch(e => {
            message.channel.send("Your name is correct... but there was an error on our side. Try again later?")
            client.error(e)
        })
    }).catch((e) => {
        message.channel.send("There was an error with Hypixel! oops...")
        client.error(e)
    })
}