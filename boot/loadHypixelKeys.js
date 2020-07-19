exports.load = (client, reload) => {
    const keys = require("../hypixelKeys.json")
    const request = require("request")
    const EventsAPI = require("../EventsAPI")
    client.keymanager = new EventsAPI.HypixelKeyManager()

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
            try { 
                const json = JSON.parse(body)
                if (!json.success) {
                    client.error(new Error(`Invalid API key ${key}`))
                }
            } catch {
                console.error(body)
            }
            client.keymanager.add(key)
        })
    }
}