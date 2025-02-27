exports.info = {
	info: "Adds you to an event Participant list",
	format: "[Event ID]",
	aliases: ["join"],
	hidden: false
}

exports.run = (client, message, [eventID]) => {

	const player = client.players.get(message.author.id)

	if (!player) {
		message.channel.send(`You are not registered! Register using \`${client.config.prefix}register <Minecraft IGN>\``)
		return
	}
	eventID = parseInt(eventID)

	
	const event = client.events.get(eventID) || client.events.find(e => e.canJoin == true)
	if (!event) {
		message.channel.send("No event found")
		return
	}

	

	if (!event.canJoin) {
		const reason = event.participants.size < (event.max || 10000000) ? "registry time has run out (15 minutes before the event)" : "max participants reached"
		message.channel.send(`You can no longer join that event, ${reason}`)
		return
	}

	if (event.participants.get(player.discord)) {
		message.channel.send("You already signed up for `" + event.name + "`!")
		return
	}

	event.participants.add(player).write().then(() => {
		message.channel.send(`You have been listed as a participant for \`${event.name}\``)
	})
}