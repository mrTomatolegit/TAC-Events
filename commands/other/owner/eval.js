exports.info = {
    info: "Evaluates the given nodejs script",
    format: "<script>",
    category: "private",
    subcategory: "other",
    aliases: [],
    hidden: true
}

const { MessageEmbed } = require("discord.js")

const clean = text => {
    if (typeof (text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

class EvalEmbed extends MessageEmbed {
    constructor(code) {
        super()
        this.code = code
        return this.addField("Input", `\`\`\`js\n${code}\`\`\``)
    }

    setFail(out) {
        return this.setColor("RED").setOutput(out)
    }

    setSuccess(out) {
        return this.setColor("GREEN").setOutput(out)
    }

    setOutput(out) {
        return this.addField("Output", `\`\`\`xl\n${clean(out)}\n\`\`\``)
    }
}
exports.run = (client, message, args) => {
    if (message.author.id !== client.config.creatorID) return
    if (!args) args = []

    const code = args.join(" ");
    const embed = new EvalEmbed(code)
    try {
        let evaled = eval(code);

        if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);

        message.channel.send(embed.setSuccess(evaled));
    } catch (err) {
        message.channel.send(embed.setFail(err));
    }
}