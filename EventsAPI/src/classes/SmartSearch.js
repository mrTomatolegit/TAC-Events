const {
    MessageEmbed
} = require("discord.js")

class LoadingDots {
    constructor(dots) {
        this.dots = dots || 3;
        this.currentAmount = 1;
    }

    toString() {
        let string = ""
        for (let i = 0; i < this.currentAmount; i++) {
            string = string + "."
        }
        this.currentAmount++
        if (this.currentAmount > this.dots) {
            this.currentAmount = 1
        }
        return string
    }
}

const loadingDots = new LoadingDots()

class SmartSearch {
    constructor(client) {
        this.client = client;
        this.hypixelCache = new Map();
        this.unmatched = 0; //
        this.invalid = 0; //
        this.bots = 0;
        this.searched = 0; //
        this.alreadyRegistered = 0;
        this.allMembers = this.getAllMembers()

        this.oldRegisteredCount = client.players.size

        this.stopped = false;


    }

    get newRegistries() {
        return this.client.players.size - this.oldRegisteredCount
    }

    get finished() {
        return this.searched === this.allMembers.length ? true : false
    }

    get embed() {
        let embed = new MessageEmbed()
            .setTitle("Discord <=> Minecraft Smart Search™")
            .setColor(this.finished ? "GREEN" : this.stopped ? "RED" : "ORANGE")
            .setFooter(`Old registry: ${this.oldRegisteredCount} | New Registry: ${this.client.players.size} | ` + (this.finished ? "Finished" : this.stopped ? "Stopped" : `Searching${loadingDots}`))
            .addField("Members searched", `${this.searched}/${this.allMembers.length}`)
            .addField("Members with no valid minecraft IGNs", this.invalid)
            .addField("Members with unmatching discord tags", this.unmatched)
            .addField("New registries", this.newRegistries)
        if (this.finished || this.stopped) {
            embed = embed.setTimestamp()
        }
        return embed
    }

    getAllMembers() {
        let members = []
        this.client.guilds.cache.forEach(guild => {
            guild.members.cache.forEach(member => {
                members.push(member)
            })
        })
        return members
    }

    async getPlayer(uuid, delayInMilliseconds) {
        await new Promise((resolve) => setTimeout(() => {
            resolve()
        }, delayInMilliseconds || 500))
        return await this.client.keymanager.next().getPlayer(uuid)
    }

    stop() {
        this.stopped = true;
        if (this.checkWorkingInterval) clearInterval(this.checkWorkingInterval)
        return this
    }

    async globalSearch(delayInMilliseconds) {
        this.stopped = false;
        this.checkWorkingInterval = setInterval(() => {
            if (this.finished) {
                clearInterval(this.checkWorkingInterval)
            } else
            if (this.searched === this.searched120secondsago) {
                this.stop();
            }
            this.searched120secondsago = this.searched
        }, 120000)
        for (let member of this.allMembers) {
            if (!this.stopped) {
                if (member.user.bot) {
                    this.searched++;
                    this.bots++;
                } else if (this.client.players.get(member.user.id)) {
                    this.alreadyRegistered++;
                    this.searched++;
                    this.client.players.get(member.user.id).update()
                } else {
                    let uuid = await this.client.mojang.getUUID(member.nickname ? escape(member.nickname) : escape(member.user.username))
                    if (!uuid) {
                        if (member.nickname) {
                            uuid = await this.client.mojang.getUUID(escape(member.user.username)).catch((e) => {
                                console.error(e)
                            })
                        }
                    }
                    if (!uuid) {
                        this.invalid++
                        this.searched++
                    } else {
                        let hypixelPlayer
                        if (this.hypixelCache.get(uuid)) {
                            return this.hypixelCache.get(uuid)
                        } else {
                            hypixelPlayer = await this.getPlayer(uuid, delayInMilliseconds).catch(async () => {
                                await new Promise((resolve) => {
                                    setTimeout(() => {
                                        resolve()
                                    }, 60000)
                                })
                                hypixelPlayer = await this.getPlayer(uuid, delayInMilliseconds).catch(() => {})
                            })
                        }

                        this.hypixelCache.set(uuid, hypixelPlayer)

                        if (!hypixelPlayer || !hypixelPlayer.socialMedia || !hypixelPlayer.socialMedia.links || !hypixelPlayer.socialMedia.links.DISCORD) {
                            this.unmatched++
                            this.searched++
                        } else {
                            const hypixelTag = hypixelPlayer.socialMedia.links.DISCORD

                            if (member.user.tag !== hypixelTag) {
                                this.unmatched++
                                this.searched++
                            } else {
                                this.client.players.add(member.user.id, uuid).write()

                                const tacMember = this.client.guilds.cache.get("617635094106210316").members.cache.get(member.user.id)
                                if (tacMember) {
                                    tacMember.setNickname(hypixelPlayer.displayname).catch(() => {})
                                    tacMember.roles.add("730086771198525482").catch(() => {})
                                    const memberGuildID = await this.client.keymanager.next().findGuildByPlayer(uuid)
                                    if (this.client.hypixelGuilds.get(memberGuildID)) {
                                        tacMember.roles.add(this.client.hypixelGuilds.get(memberGuildID).role).catch(() => {})
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    async singleSearch(user, delayInMilliseconds) {
        if (user.bot) {
            return null
        }

        this.client.guilds.cache.forEach(guild => {
            const member = guild.members.cache.get(user.id)
            if (!member) return

            if (this.client.players.get(member.user.id)) {
                this.client.players.get(member.user.id).update()
                return this.client.players.get(member.user.id)
            }
            this.client.mojang.getUUID(member.nickname ? escape(member.nickname) : escape(member.user.username)).then(async uuid => {
                if (!uuid) {
                    if (member.nickname) {
                        uuid = await this.client.mojang.getUUID(escape(member.user.username)).catch((e) => {
                            console.error(e)
                        })
                    }
                    if (!uuid) {
                        return null
                    }
                }
                const hypixelPlayer = this.hypixelCache.get(uuid) || await this.getPlayer(uuid, delayInMilliseconds)
                this.hypixelCache.set(uuid, hypixelPlayer)

                if (!hypixelPlayer || !hypixelPlayer.socialMedia || !hypixelPlayer.socialMedia.links || !hypixelPlayer.socialMedia.links.DISCORD) {
                    return null
                }
                const hypixelTag = hypixelPlayer.socialMedia.links.DISCORD

                if (member.user.tag !== hypixelTag) {
                    return null
                }

                this.client.players.add(member.user.id, uuid).write()

                const tacMember = this.client.guilds.cache.get("617635094106210316").members.cache.get(member.user.id)
                if (tacMember) {
                    tacMember.setNickname(hypixelPlayer.displayname).catch(() => {})
                    tacMember.roles.add("730086771198525482").catch(() => {})
                    const memberGuildID = await this.client.keymanager.next().findGuildByPlayer(uuid)
                    if (this.client.hypixelGuilds.get(memberGuildID)) {
                        tacMember.roles.add(this.client.hypixelGuilds.get(memberGuildID).role).catch(() => {})
                    }
                }
                return this.client.players.get(member.user.id)
            })
        })
    }
}

module.exports = SmartSearch