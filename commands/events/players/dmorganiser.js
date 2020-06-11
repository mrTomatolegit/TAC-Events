exports.info = {
	info: "DMs the event organiser a message",
	format: "[Event ID]",
	aliases: ["dmorg"],
	hidden: false
}
const Discord = require('discord.js')
let cooldown = new Map()
const waitTime = 5

exports.run = (client, message, [eventID]) => {
	const cooldowned = cooldown.get(message.author.id)
	if (cooldowned) {
		const timePassed = (new Date().getTime() - cooldowned.getTime()) / 60000
		if (timePassed < waitTime) {
			message.channel.send(`You are on cooldown! You can use this command in \`${Math.floor((waitTime - timePassed) * 60)}\` seconds`)
			return
		}
	}

	const event = client.events.find(e => e.id === eventID) || client.events.find(e => e.canJoin == true)
	if (!event) {
		message.channel.send("No event found")
		return
	}
	const organiserID = event.organiser
	const organiser = client.users.cache.get(organiserID)

	if (!organiser) {
		message.channel.send("I couldn't find the organiser")
		return
	}

	message.channel.send("What would you like to send?").then(m => {
		m.channel.awaitMessages(m => m.author.id === message.author.id, {max:1, time: 120000}).then(collected => {
			const text = collected.first().content
			if (text.length < 6) {
				message.channel.send("Message too short")
				return
			}
			const embed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag + " (TAC event participant)", message.author.avatarURL())
				.setDescription(text)
				.addField("Event name", event.name, true)
				.addField("Event ID", event.id, true)
				.addField("Event date", event.date.toUTCString(), true)
				.setColor("RANDOM")
			cooldown.set(message.author.id, new Date())
			organiser.send(embed).then(() => {
				message.channel.send("Success!")
			}).catch(() => {
				message.channel.send("There was an error DMing the organiser")
			})
		})
	})
}