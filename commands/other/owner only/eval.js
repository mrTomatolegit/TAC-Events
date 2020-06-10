exports.info = {
    info: "Evaluates the given nodejs script",
    format: "<script>",
    category: "private",
    subcategory: "other",
    aliases: [],
    hidden: true
}

exports.run = (client, message, args) => {
    if (message.author.id !== client.config.creatorID) return
    let script = ""
    args.forEach(arg => {
        script = script + arg + " "
    })
    script = script.trim()
    if (script.length < 2) {
        message.channel.send("I can't evaluate thin air!")
        return
    }
    try {
        eval(script)
    } catch(e) {
        message.channel.send(e.message)
    }
}