exports.load = (client, reload) => {
    if (reload) {
        return
    }
    const Hypixel = require("hypixel")
    client.hypixel = new Hypixel({ key: process.env.token });

    const request = require("request")
    client.mojang = {
        getUUID: (IGN) => {
            return new Promise((resolve, reject) => {
                request(`https://api.mojang.com/users/profiles/minecraft/${IGN}`, (err, response, body) => {
                    if (err) {
                        client.error(err)
                        reject(err)
                        return
                    }
                    if (!body || body.length < 1) {
                        resolve(null)
                        return
                    }
                    const profile = JSON.parse(body)
                    resolve(profile.id)
                })
            })
        },
        getName: (UUID) => {
            return new Promise((resolve, reject) => {
                request(`https://api.mojang.com/user/profiles/${UUID}/names`, (err, response, body) => {
                    if (err) {
                        client.error(err)
                        reject(err)
                        return
                    }
                    if (!body || body.length < 1) {
                        resolve(null)
                        return
                    }
                    const profile = JSON.parse(body)
                    resolve(profile[profile.length-1] ?  profile[profile.length-1].name : null)
                })
            })
        }
    }
}