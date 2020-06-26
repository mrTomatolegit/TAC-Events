module.exports = (client) => {
    client.user.setPresence({activity: {name: `${client.config.prefix}help`, type: "PLAYING"}})
    console.log(`${client.user.tag} has connected to discord!`)

    return new Promise((resolve, reject) => {
        client.players.fetch().then(() => {
            client.settings.fetch().then(() => {
                client.announcements.fetch().then(() => {
                    console.log('a')
                    client.events.fetch().then(events => {
                        console.log("a")
                        events.forEach(event => {
                            event.participants.fetch().then(() => {
                                resolve()
                            }).catch(e => {
                                reject(e)
                            })
                        })
                    }).catch(e => {
                        reject(e)
                    })
                }).catch(e => {
                    reject(e)
                })
            }).catch((e) =>{
                reject(e)
            })
        }).catch((e) => {
            reject(e)
        })
    })
}