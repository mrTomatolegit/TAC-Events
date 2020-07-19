const { MessageEmbed } = require("discord.js")

exports.info = {
    info: "Registers your IGN into the database",
    format: "<Minecraft IGN>",
    aliases: ["reg"],
    hidden: false
}

exports.run = async (client, message, [IGN]) => {

    const tac = client.guilds.cache.get("617635094106210316")

    if (!IGN) {
        message.reply("You need to specify your ign")
        return
    }

    const player = client.players.get(message.author.id)
    if (player != null) {
        message.channel.send(`Your account is already registered as \`${await player.getIGN()}\`!\nIf you believe this is an error please contact a staff member`)
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

    const m = await message.reply("checking...")
    client.keymanager.next().getPlayer(uuid).then(async hypixelPlayer => {
        if (!hypixelPlayer || !hypixelPlayer.socialMedia || !hypixelPlayer.socialMedia.links) {
            m.edit("Please link your Discord account with your in-game account. If you cannot or don't understand, ask a staff member for assistance.")
            return
        }
        const tag = hypixelPlayer.socialMedia.links.DISCORD
        if (!tag) {
            m.edit("Please link your Discord account with your in-game account. If you cannot or don't understand, ask a staff member for assistance.")
            return
        } else
        if (message.author.tag !== tag) {
            m.edit("The Discord tag associated with this player is not the same as your current tag")
            return
        }

        const player = client.players.add(message.author.id, uuid)

        player.write().then(async () => {
            m.edit(`Success! Your discord account is now linked to \`${IGN}\``)
        }).catch(e => {
            m.edit("Your name is correct... but there was an error on our side. Try again later?")
            client.error(e)
        })

        const tacMember = tac.members.cache.get(message.member.user.id)
        let rolesAssigned = [tac.roles.cache.get("730086771198525482") ? tac.roles.cache.get("730086771198525482").name : null]

        if (tacMember) {
            tacMember.setNickname(hypixelPlayer.displayname).catch(() => {})
            tacMember.roles.add("730086771198525482")
            const memberGuildID = await client.keymanager.next().findGuildByPlayer(uuid)
            if (client.hypixelGuilds.get(memberGuildID) && client.hypixelGuilds.get(memberGuildID).role) {
                tacMember.roles.add(client.hypixelGuilds.get(memberGuildID).role).catch(() => {})
                rolesAssigned.push(client.hypixelGuilds.get(memberGuildID).role.name)
            }
        }
        message.author.send(new MessageEmbed()
            .setTitle("**You have been verified!**\n")
            .setColor("GREEN")
            .setTimestamp()
            .addField("Minecraft Name", hypixelPlayer.displayname, true)
            .addField("Roles assigned", rolesAssigned.join("\n"))
            .setFooter(tac.name, tac.iconURL())
        )
    }).catch((e) => {
        m.edit("There was an error with Hypixel! oops...")
        client.error(e)
    })
}