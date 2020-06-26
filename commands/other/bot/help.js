exports.info = {
    info: "Does ***this***",
    format: "<command or category>",
    aliases: ["?"],
    hidden: false
}

const Discord = require("discord.js")

const constructCategories = (map) => {
    let categories = []
    map.forEach(command => {
        const info = command.info
        if (!info) return
        if (info.hidden == true) {
            return
        }
        if (info.category) {
            if (!categories.includes(info.category)) {
                categories.push(info.category)
            }
        }
    })
    return categories
}

const constructSubs = (category, commandList) => {
    let subcategories = []
    commandList.forEach(command => {
        if (command.info.hidden == true) {
            return
        }
        const cat = command.info.category
        const subcat = command.info.subcategory
        if (cat === category) {
            let found = subcategories.findIndex(subcateg => subcateg.name.toLowerCase().trim() === subcat.toLowerCase().trim())
            if (found === -1) {
                subcategories.push({name: upperFirst(subcat), commands: []})
                found = subcategories.length-1
            }
            subcategories[found].commands.push(command.info.name)
        }
    })
    return subcategories
}

const upperFirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

exports.run = (client, message, [selected]) => {
    if (client.commandManager.aliases.get(selected)) {
        selected = client.commandManager.aliases.get(selected)
    }
    const commandFile = client.commandManager.commands.get(selected)
    if (commandFile) {
        var commandInfo = commandFile.info
    }
    if (commandInfo) {
        let embed = new Discord.MessageEmbed()
        .setTitle(`The \`${selected}\` command`)
        .setDescription(commandInfo.info || "No info given")
        .addField("Format", `\`${client.config.prefix}${(selected + " " +commandInfo.format).trim()}\`` || "No format given")
        .setColor("RED")
        if (commandInfo.aliases && commandInfo.aliases.length > 0) {
            let aliases = ""
            commandInfo.aliases.forEach(alias => {
                aliases = `${aliases} \`${alias}\``
            })
            aliases = aliases.trim()
            embed = embed.addField("Aliases", `${aliases}`)
        }
        message.channel.send({embed})
        return
    }
    const categories = constructCategories(client.commandManager.commands)
    if (categories.includes(selected)) {
        var subcategories = constructSubs(selected, client.commandManager.commands)
        let embed = new Discord.MessageEmbed()
        .setTitle(`${upperFirst(selected)} commands`)
        .setDescription(`Run \`${client.config.prefix}help <command>\` to get commands about a specific command`)
        .setColor("ORANGE")
        .setTimestamp(new Date(client.config.createdAt))
        subcategories.forEach(sub => {
            let list = ""
            sub.commands.forEach(command => {
                list = `${list}\`${command}\` `
            })
            list = list.trim()
            embed = embed.addField(sub.name, list)
        })
        message.channel.send({embed})
        return
    }
    let description = ""
    categories.forEach(cat => {
        description = `${description}\`${upperFirst(cat)}\`\n\n`
    })
    description = description.trim()
    const creator = client.users.cache.get("337266897458429956")
    const embed = new Discord.MessageEmbed()
        .setTitle("My command categories")
        .setDescription(`Run \`${client.config.prefix}help <category>\` to get commands about a specific category\n\n${description}`)
        .setThumbnail(client.user.avatarURL())
        .setFooter(`Bot made by ${creator.tag}`, creator.avatarURL())
        .setColor("BLUE")
        .setTimestamp(new Date(client.config.createdAt))
    message.channel.send({embed})
}