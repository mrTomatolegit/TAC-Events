module.exports = (client) => {
    client.user.setPresence({activity: {name: `${client.config.prefix}help`, type: "PLAYING"}})
    console.log(`${client.user.tag} has connected to discord!`)
}