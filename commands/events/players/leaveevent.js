exports.info = {
	info: "Removed you from an event Participant list",
	format: "[Event ID]",
	aliases: ["leave"],
	hidden: false
}

exports.run = (client, message, [eventID]) => {

	const player = client.players.find(p => p.discordID === message.author.id)

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

	if (!event.participants.get(player.discord)) {
		message.channel.send("You are not signed up for `" + event.name + "`!")
		return
	}

	if (!event.canJoin) {
		message.channel.send(`You can't leave this event now!`)
		return
	}

    event.participants.remove(player)
	message.channel.send(`You have been removed from the participant list for \`${event.name}\``)
}