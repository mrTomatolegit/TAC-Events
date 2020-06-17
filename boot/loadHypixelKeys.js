exports.load = (client, reload) => {
    const keys = require("../hypixelKeys.json")
    const request = require("request")
    client.keymanager = new client.HypixelKeyManager()

    for (key of keys) {
        request(`https://api.hypixel.net/key?key=${key}`, (err, response, body) => {
            if (err) {
                client.error(err)
                return
            }
            if (body.length < 1) {
                client.error(new Error(`No response from hypixel api, key: ${key}`))
                return
            }
            const json = JSON.parse(body)
            if (!json.success) {
                client.error(new Error(`Invalid API key ${key}`))
            }
            client.keymanager.add(key)
        })
    }
}