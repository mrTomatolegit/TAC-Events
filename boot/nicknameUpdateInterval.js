exports.load = (client, reload) => {
    if (reload) {
        return
    }
    exports.updateNicknames = async () => {
        return new Promise(async resolve => {
            let changed = []
            const tac = client.guilds.cache.get("617635094106210316")
            if (!tac) return
            new Promise((res, rej) => {
                client.players.forEach(async (player, index, map) => {
                    const member = tac.members.cache.get(player.discord)
                    if (member) {
                        const ign = await player.getIGN()
                        console.log(member.user.tag, "=>", ign)
                        if (member.nickname !== ign) {
                            changed.push(ign)
                            await member.setNickname(ign).catch(() => {})
                        }
                    }
                    if (index === map.lastKey()) {
                        res()
                    }
                })
            }).then(() => {
                resolve(changed)
            })
        })
    }

    const schedule = require("node-schedule")
    client.nicknameUpdateJob = schedule.scheduleJob("nicknameUpdateJob","0 */2 * * *", async () => {
        this.updateNicknames().then((e) => {
            console.log("Automatic nickname updater changed names: ", e)
        })
    })
}