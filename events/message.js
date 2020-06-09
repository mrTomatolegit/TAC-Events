module.exports = (client, message) => {
    if (message.author.bot) return

    if (message.channel.type === "dm") {
        if (!client.config.dms) {
            return
        }
    }

    if (!message.content.startsWith(client.config.prefix)) return 

    if (message.author.id !== client.config.creatorID) {
        if (!client.config.active) {
            return
        } else if (private && message.guild.id !== private) {
            return
        }
    }

    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase()

    const commandManager = client.commandManager

    const alias = commandManager.aliases.get(command)
    const cmd = commandManager.commands.get(command) || commandManager.commands.get(alias)

    if (cmd) {
        console.log(`${message.author.tag} &${message.author.id} => ${command}`)
        cmd.run(client, message, args)
    } else {
        message.reply(`Invalid command! Run \`${client.config.prefix}help\` to get a list of all available commands.`);
    }
}