exports.info = {
	info: "Lists all of the events registered or info about a specific event",
	format: "[Event ID]",
	aliases: ["list", "eventlist"],
	hidden: false
}

const Discord = require("discord.js")
const eventsPerPage = 10
const emojis = ["⏪", "◀️", "⛔", "▶️", "⏩"]

const formatDate = (date) => {
	if (date == null) {
		return "null"
	}
	return `${date.getUTCDate().toString().padStart(2, "0")}/${(date.getUTCMonth()+1).toString().padStart(2, "0")}/${date.getUTCFullYear().toString().substr(2)} ${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}`
}

exports.run = (client, message, [eventID]) => {
	const getPage = (page) => {
		let list
		let longestName = 0
		let longestID = 0
		const start = page * eventsPerPage
		const end = start + eventsPerPage
		client.events.forEach(event => {
			const name = event.name
			if (name.length > longestName) {
				longestName = name.length
			}
			const id = event.id.toString()
			if (id.length > longestID) {
				longestID = id.length
			}
		})
		client.events.forEach((event, index) => {
			if (index >= start && index < end) {
				list = `${list || ""}${event.id.toString().padStart(longestID, " ")}. ${event.name.padEnd(longestName, " ")}   ${formatDate(event.date)}\n`
			}
		})
		return `\`\`\`${list || "No events found"}\`\`\``
	}
	if (!isNaN(eventID)) {
		eventID = parseInt(eventID)
		const event = client.events.get(eventID)
		if (event) {
			let left
			let right
			new Promise((resolve) => {
				console.log(event.participants)
				console.log(event.participants.size)
				if (event.participants) {
					console.log("shit")
					let i = 0
					event.participants.forEach(async (p, index, map) => {
						console.log("works")
						p.player.getIGN().then(IGN => {
							console.log("aaa")
							left = `${left || ""}${p.player.user}\n`
							right = `${right || ""}${IGN}`
							console.log(index, map.size - 1)
							if (i === map.size-1) resolve()
							i++
						})
					})
				} else {
					resolve()
				}
			}).then(() => {
				console.log("aa2aa")
				const organiser = client.users.cache.get(event.organiser)
				const embed = new Discord.MessageEmbed()
					.setTitle(event.name)
					.setDescription(`An event registered using ${client.user}`)
					.setThumbnail(message.guild.iconURL())
					.setFooter(message.guild.name, message.guild.iconURL())
					.setTimestamp(event.date)
					.addField("Organiser", organiser ? `${organiser.tag} ||${organiser}||` : event.organiser)
					.addField("Date", event.date ? event.date.toUTCString(): "No date")
					.addField("Maximum participants", event.max)
					.addField("Discord", left || "No participants", true)
					.addField("Minecraft", right || "No participants", true)
					.setColor("RANDOM")
				message.channel.send({embed})
			})
			return
		}
	}

	const embed = new Discord.MessageEmbed()
		.setTitle("Events (All time)")
		.setThumbnail(message.guild.iconURL())
		.setFooter(message.guild.name, message.guild.iconURL())
		.setColor("RANDOM")
		.setTimestamp()
	let page = 0
	const maxPages = Math.floor((client.events.size - 1) / eventsPerPage)
	let firstEmbed = embed.setDescription(getPage(page))
	console.log(firstEmbed)
	message.channel.send(firstEmbed).then(m => {
		emojis.forEach(async emoji => {
			await m.react(emoji)
		})
		const collector = new Discord.ReactionCollector(m, (r, u) => u.id === message.author.id, {
			time: 120000
		})
		collector.on("collect", (r, u) => {
			switch (emojis.findIndex(emoji => emoji === r.emoji.name)) {
				case -1:
					collector.stop()
					break
				case 0:
					page = 0
					m.edit(embed.setDescription(getPage(page)))
					r.users.remove(message.author.id)
					break
				case 1:
					page--
					if (page < 0) {
						page = 0
					}
					m.edit(embed.setDescription(getPage(page)))
					r.users.remove(message.author.id)
					break
				case 2:
					collector.stop()
					break
				case 3:
					page++
					if (page > maxPages) {
						page = maxPages
					}
					m.edit(embed.setDescription(getPage(page)))
					r.users.remove(message.author.id)
					break
				case 4:
					page = maxPages
					m.edit(embed.setDescription(getPage(page)))
					r.users.remove(message.author.id)
					break
			}
		})
		collector.on("end", () => {
			m.edit(embed.setColor("GRAY"))
			m.reactions.removeAll()
		})
	})
}