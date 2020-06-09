exports.load = (client, reload) => {
    return new Promise(resolve => {
        if (reload) {
            delete client.config
            delete require.cache[require.resolve(`../config.json`)]
        }
        console.log("Loading config file")
        client.config = require(`../config.json`)
        resolve()
    })
}