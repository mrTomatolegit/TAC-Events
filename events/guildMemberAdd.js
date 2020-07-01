module.exports = (client, newMember) => {
    client.db.all(`SELECT * FROM players`, async (err, rows) => {
        const logger = console
        if (err) {
            return message.channel.send("There was an error there... oops")
        }
        client.guilds.cache.forEach(guild => {
            let member = guild.members.cache.get(newMember.user.id)
            if (!member) return

            if (member.user.bot) {
                logger.log(`${member.user.tag} IS NOT A SEARCHABLE CLIENT`)
                return
            }
            if (rows.find(r => r.discord === member.user.id)) {
                logger.log(`${member.user.tag} is already registered`)
                return
            }
            client.mojang.getUUID(member.nickname ? escape(member.nickname) : escape(member.user.username)).then(async uuid => {
                if (!uuid) {
                    if (member.nickname) {
                        uuid = await client.mojang.getUUID(escape(member.user.username)).catch(() => {})
                    }
                    if (!uuid) {
                        logger.log(`${member.user.tag} (${member.nickname}) INVALID IGNs`)
                        return
                    }
                }
                const hypixelPlayer = await client.keymanager.next().getPlayer(uuid)
                if (!hypixelPlayer || !hypixelPlayer.socialMedia || !hypixelPlayer.socialMedia.links || !hypixelPlayer.socialMedia.links.DISCORD) {
                    logger.log(`(${member.nickname}) ${member.user.tag} DOES NOT HAVE A HYPIXEL TAG`)
                    return
                }
                const tag = hypixelPlayer.socialMedia.links.DISCORD
                if (`${member.user.tag}` !== `${tag}`) {
                    logger.log(`(${member.nickname}) ${member.user.tag} TAG DOES NOT MATCH ${tag}`);
                    return
                }
                logger.log(`${member.user.tag} (${member.nickname}) was registered as ${hypixelPlayer.displayname}`)
                client.players.add(member.user.id, uuid).write()
                const tacMember = tac.members.cache.get(member.user.id)
                tacMember ? tacMember.setNickname(hypixelPlayer.displayname).catch(() => {}) : null
            }).catch(() => {})
        });
    })
}