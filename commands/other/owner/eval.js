exports.info = {
    info: "Evaluates the given nodejs script",
    format: "<script>",
    aliases: [],
    hidden: true
}

const {MessageEmbed} = require("discord.js")

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
        return this.addField("Input", `\`\`\`js\n${code.length < 500 ? code : code.substr(0, 500).trim() + "..."}\`\`\``)
    }

    format(text) {
        return text.length < 200 ? text : text.substr(0, 200).trim() + "..."
    }

    setFail(out) {
        return this.setColor("RED").setOutput(out)
    }

    setSuccess(out) {
        return this.setColor("GREEN").setOutput(out)
    }

    setOutput(out) {
        out = require("util").inspect(out)
        return this.addField("Output", `\`\`\`xl\n${clean(this.format(out))}\n\`\`\``)
    }

    setUnresolved(out) {
        out = require("util").inspect(out)
        return this.setColor("ORANGE").addField("Awaiting promise", `\`\`\`xl\n${clean(this.format(out))}\n\`\`\``)
    }

    setPromise(out) {
        out = require("util").inspect(out)
        return this.setColor("GREEN").addField('Promise result', `\`\`\`xl\n${clean(this.format(out))}\n\`\`\``)
    }
}
exports.run = (client, message, args) => {
    if (message.author.id !== client.config.creatorID) return

    if (!args || !Array.isArray(args) || args.length < 1) args = ["message.channel.send(\"This is a test script\")"]
    let silent = false
    if (args[0] === "silent") {
        message.delete()
        silent = true
        args.shift()
    }
    const code = args.join(" ");
    let embed = new EvalEmbed(code)
    try {
        let evaled = eval(code);
        if (!silent) {
        if (evaled instanceof Promise) {
            embed = embed.setUnresolved(evaled)
        } else {
            embed = embed.setSuccess(evaled)
        }

        const m = message.channel.send(embed)

        if (evaled instanceof Promise) 
            Promise.all([evaled, m]).then((a) => {
                a[1].edit((embed.setPromise(a[0])))
            })
        }
    } catch (err) {
        if (!silent) {
            message.channel.send(embed.setFail(err))
        }
    }
}