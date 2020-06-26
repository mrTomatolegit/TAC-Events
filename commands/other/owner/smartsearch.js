exports.info = {
    info: "Does this even work?",
    format: "",
    aliases: [],
    hidden: true
}

const whitelist = ["337266897458429956"]

const tacGuild = "617635094106210316"

const guildRoles = ["637717456215080991", "637717494949347333", "637717659877769241", "637717604462755840", "682674712211488800", "637717548426723369", "637718203484602369", "637717712264495119"]

let {EventEmitter} = require("events")
const search = new EventEmitter()

exports.run = (client, message) => {
    let unmatched = []
    let registered = []
    let invalid = []
    let searched = []
    if (whitelist.includes(message.author.id)) {
        message.channel.send("This is gonna go so so wrong...")
        message.channel.send("User IGN search has commenced")
        const tac = client.guilds.cache.get(tacGuild)
        client.db.all(`SELECT * FROM players`, (err, rows) => {
            if (err) {
                return message.channel.send("There was an error there... oops")
            }

            tac.members.cache.forEach(member => {
                if (member.user.bot) return
                if (!member.roles.cache.find(r => guildRoles.includes(r.id))) return
                if (rows.find(r => r.discord === member.user.id)) {
                    return console.log(`${member.user.tag} is already registered`)
                }
                searched.push(member)
                client.mojang.getUUID(member.nickname || member.user.username).then(uuid => {
                    if (!uuid) {
                        invalid.push(member)
                        return console.warn(`${member.user.tag} (${member.nickname}) INVALID IGNs`)
                    }
                    client.keymanager.next().getPlayer(uuid).then(hypixelPlayer => {
                        if (!hypixelPlayer) {
                            return
                        }
                        if (!hypixelPlayer.socialMedia) {
                            return
                        }
                        if (!hypixelPlayer.socialMedia.links) {
                            return
                        }
                        const tag = hypixelPlayer.socialMedia.links.DISCORD
                        if (!tag) {
                            return
                        } else
                        if (`${member.user.tag}` !== `${tag}`) {
                            unmatched.push(member)
                            return console.warn(`(${member.nickname}) ${member.user.tag} TAG DOES NOT MATCH ${tag}`)
                        }
                        console.log(`${member.user.tag} (${member.nickname}) was registered as ${hypixelPlayer.displayname}`)
                        client.players.add(member.user.id, uuid).write()
                        registered.push(member)
                    })
                })
            })
        })
    }
}