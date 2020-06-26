exports.info = {
    info: "Sets the role which will be pinged when events start",
    format: "<role or \"remove\">",
    aliases: [],
    hidden: false
}

exports.run = (client, message, [roleID]) => {
    if (!message.member.hasPermission("MANAGE_ROLES")) return
    if (!roleID) return
    const regex = new RegExp(/[0-9]{18}/)
    const finds = roleID.match(regex)
    if (!finds || finds.length < 1) {
        if (roleID.toLowerCase() === "remove") {
            const announce = client.announcements.get(message.guild.id)
            if (!announce) {
                message.channel.send("Announcement settings were never set")
                return
            } 
            announce.setRole().write().then(() => {
                message.channel.send("Role was removed from announcement pings")
            })
        } else {
            message.channel.send("You didn't give me a role")
        }
        return
    }
    const role = message.guild.roles.cache.get(finds[0])
    if (!role) {
        message.channel.send("I could not find that role in your server")
        return
    }
    console.log(client.announcements)
    const registered = client.announcements.get(message.guild.id)
    if (!registered) {
        message.channel.send("You need to set an announcements channel to do that!")
        return
    }
    registered.setRole(role).write().then(() => {
        message.channel.send(`The role ${role.name} was set as the announcements pingrole`)
    })
}