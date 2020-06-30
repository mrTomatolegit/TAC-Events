exports.info = {
    info: "Does this even work?",
    format: "[send log]",
    aliases: [],
    hidden: true
}

const whitelist = ["337266897458429956"]

const tacGuild = "617635094106210316"

let lastSearch = null
let {
    EventEmitter
} = require("events")
const {
    MessageEmbed
} = require("discord.js")
const {
    Console
} = require("console")
const fs = require("fs")

exports.run = async (client, message, [sendlogs]) => {
    if (whitelist.includes(message.author.id)) {
        fs.writeFileSync("./data/smartsearch.log", "")
        const logger = new Console({
            stdout: fs.createWriteStream("./data/smartsearch.log")
        })
        if (lastSearch && (new Date() - lastSearch) / 60000 < 5) {
            return message.channel.send("This command was already run not long ago, please slow down")
        }
        lastSearch = new Date().getTime()
        const search = new EventEmitter()
        let hypixelCache = new Map()
        let unmatched = []
        let registered = []
        let invalid = []
        let searched = []
        let shit = 0

        const tac = client.guilds.cache.get(tacGuild)
        client.db.all(`SELECT * FROM players`, async (err, rows) => {
            if (err) {
                return message.channel.send("There was an error there... oops")
            }
            const embedstart = () => {
                return new MessageEmbed()
                .setTitle("Smart search stats")
                .addField("Total members searched", searched.length + "/" + shit)
                .addField("Total members with no valid minecraft IGNs", invalid.length)
                .addField("Total members with unmatching discord tags", unmatched.length)
                .addField("Total new registries", registered.length)
                .setFooter(`Old registry count: ${rows.length} | New registry count: ${client.players.size}`)
                .setTimestamp()
                .setColor("ORANGE")
            }
            
            const holymessage = await message.channel.send(embedstart())
            let interval = setInterval(() => {
                holymessage.edit(embedstart())
            }, 3000)
            search.on("done", () => {
                holymessage.edit(embedstart().setColor("GREEN"))
                if (sendlogs) {
                    message.channel.send({files: ["./data/smartsearch.log"]})
                }
                clearInterval(interval)
            })
            client.guilds.cache.forEach(guild => {
                shit = guild.members.cache.size-1 + shit
                for (let i = 0, p = Promise.resolve(); i < guild.members.cache.size - 1; i++) {
                    p = p.then(_ => new Promise(async resolve => {
                        await new Promise((resolve) => setTimeout(() => {resolve()}, 500))
                        let index = Array.from(guild.members.cache.keys())[i]
                        let member = guild.members.cache.get(index)
                        let map = guild.members.cache
                        const isLast = () => {
                            return searched.length === shit
                        }
                        if (member.user.bot) {
                            searched.push(member)
                            logger.log(`${member.user.tag} IS NOT A SEARCHABLE CLIENT`)
                            if (isLast()) search.emit("done")
                            return resolve()
                        }
                        if (rows.find(r => r.discord === member.user.id) || registered.find(m => m.user.id === member.user.id)) {
                            searched.push(member)
                            if (isLast()) search.emit("done")
                            logger.log(`${member.user.tag} is already registered`)
                            return resolve()
                        }
                        client.mojang.getUUID(escape(member.nickname) || escape(member.user.username)).then(async uuid => {
                            if (!uuid) {
                                if (member.nickname) {
                                    uuid = await client.mojang.getUUID(escape(member.user.username)).catch((e) => {resolve(); console.error(e)})
                                }
                                if (!uuid) {
                                    invalid.push(member)
                                    searched.push(member)
                                    if (isLast()) search.emit("done")
                                    logger.log(`${member.user.tag} (${member.nickname}) INVALID IGNs`)
                                    return resolve()
                                }
                            }
                            const hypixelPlayer = hypixelCache.get(member.user.id) || await client.keymanager.next().getPlayer(uuid)
                            hypixelCache.set(member.user.id, hypixelPlayer)
                            if (!hypixelPlayer || !hypixelPlayer.socialMedia || !hypixelPlayer.socialMedia.links || !hypixelPlayer.socialMedia.links.DISCORD) {
                                unmatched.push(member)
                                searched.push(member)
                                logger.log(`(${member.nickname}) ${member.user.tag} DOES NOT HAVE A HYPIXEL TAG`)
                                if (isLast()) search.emit("done")
                                return resolve() 
                            }
                            const tag = hypixelPlayer.socialMedia.links.DISCORD
                            if (`${member.user.tag}` !== `${tag}`) {
                                unmatched.push(member)
                                searched.push(member)
                                if (isLast()) search.emit("done")
                                logger.log(`(${member.nickname}) ${member.user.tag} TAG DOES NOT MATCH ${tag}`);
                                return resolve()
                            }
                            logger.log(`${member.user.tag} (${member.nickname}) was registered as ${hypixelPlayer.displayname}`)
                            client.players.add(member.user.id, uuid).write()
                            registered.push(member)
                            searched.push(member)
                            const tacMember = tac.members.cache.get(member.user.id)
                            tacMember ? tacMember.setNickname(hypixelPlayer.displayname).catch((e) => {console.error(e)}) : null
                            if (isLast()) search.emit("done")
                            resolve()
                        }).catch((e) => {resolve(); console.error(e)})
                    }));
                }
            })
        })
    }
}
