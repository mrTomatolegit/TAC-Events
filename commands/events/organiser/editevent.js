exports.info = {
	info: "Edits a pre-existing event new event",
	format: '<Event ID> <"name" or "date" or "max">',
	aliases: ["changeevent", "modevent"],
	hidden: false
}

const findDate = (m3content) => {
	const dateRegex = new RegExp(/[0-9]{1,2}/g)
	const finds = m3content.match(dateRegex)
	if (!finds || finds.length < 5) {
		return null
	}
	finds.forEach((find, index) => {
		finds[index] = parseInt(find)
	})
	const date = new Date()
	date.setUTCDate(finds[0])
	date.setUTCMonth(finds[1] - 1)
	date.setUTCFullYear(eval(`20${finds[2]}`))
	date.setUTCHours(finds[3])
	date.setUTCMinutes(finds[4])
	date.setUTCSeconds(0)
	date.setUTCMilliseconds(0)
	return date
}

exports.run = (client, message, [eventID, option]) => {
	if (!message.member.roles.cache.find(r => r.id === client.settings.manager)) {
		message.channel.send("You must be the event manager to do this!")
		return
	}

	if (!eventID) {
		message.channel.send("You need to specify an Event ID!")
		return
	} 
	if (isNaN(eventID)) {
		message.channel.send("That Event ID is not a number!")
		return
	}
	eventID = parseInt(eventID)

	const event = client.events.find(e => e.id === eventID)
	if (!event) {
		message.channel.send("That Event ID is not linked to an event")
		return
	}

	if (!option) {
		message.channel.send("You need to tell me what to modify!")
		return
	}

	option = option.toLowerCase()

	if (option === "name") {
		message.channel.send("What would you like to set the event name as?").then(m => {
			m.channel.awaitMessages(m=> m.author.id === message.author.id, {max:1}).then(collected => {
				const m2 = collected.first()
				event.setName(m2.content)
				event.writeE()
				m2.channel.send("The event was renamed to `" + event.name + "`")
			})
		})
	} else 
	if (option === "date") {
		message.channel.send("What would you like the event's date to be? DD/MM/YY HH:MN").then(m => {
			m.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1}).then(collected => {
				const m2 = collected.first()
				const foundDate = findDate(m2.content)
				event.setDate(foundDate)
				event.writeE()
				message.channel.send(`${event.name} is now scheduled for \`${event.date ? event.date.toUTCString() : null}\``)
			})
		})
	} else 
	if (option === "max") {
		message.channel.send("What would you like the event's maximum participants to be?").then(m => {
			m.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1}).then(collected => {
				const m2 = collected.first()
				if (isNaN(m2.content)) {
					message.channel.send("That isn't a number")
					return
				}
				event.setMax(parseInt(m2.content))
				event.writeE()
				message.channel.send(`The event's maximum participants are now \`${event.max}\``)
			})
		})
	} else {
		message.channel.send("Invalid option `" + option + "`, please choose `name`, `date` or `max`")
	}
}