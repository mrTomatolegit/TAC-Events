const schedule = require("node-schedule")
const Discord = require("discord.js")
const Hypixel = require("hypixel")
exports.load = (client, reload) => {
	client.Player = class Player {
		constructor(ID, UUID, written) {
			this.discordID = ID
			this.minecraftUUID = UUID

			this.written = written || false
		}

		write() {
			if (!this.written) {
				return new Promise((resolve, reject) => {
					client.db.all(`INSERT INTO registry(discordID, minecraftUUID) VALUES($discordID, $minecraftUUID)`, {
						$discordID: this.discordID,
						$minecraftUUID: this.minecraftUUID
					}, (err, out) => {
						if (err) {
							reject(err)
							return
						}

						this.written = true
						resolve(this)
					})
				})
			} else {
				client.db.all(`UPDATE registry SET minecraftUUID = $minecraftUUID WHERE discordID = $discordID`, {
					$discordID: this.discordID,
					$minecraftUUID: this.minecraftUUID
				}, (err, out) => {
					if (err) {
						reject(err)
						return
					}
					resolve(this)
				})
			}
		}

		getIGN() {
			return new Promise(async (resolve, reject) => {
				resolve(await client.mojang.getName(this.minecraftUUID))
			})
		}

		get user() {
			return client.users.cache.get(this.discordID)
		}

	}

	client.Event = class Event {
		constructor(name, id, organiser) {
			this.name = name
			this.id = id || null
			this.participants = []
			this.max = null
			this.date = null
			this.job = undefined
			this.organiser = organiser
		}

		setName(name) {
			this.name = name
			return this
		}

		get announceDate() {
			const date = new Date(this.date.getTime())
			date.setMinutes(date.getMinutes() - 10)
			console.log()
			return date
		}

		setDate(Date) {
			this.date = Date
			if (this.job) {
				this.job.cancel()
			}
			this.job = schedule.scheduleJob(this.name, this.announceDate, () => {
				this.announce()
			})
			return this
		}

		setMax(Integer) {
			this.max = Integer
			return this
		}

		announce() {
			const announChannel = client.channels.cache.get(client.settings.announcements)
			const organiser = this.organiser ? client.users.cache.get(this.organiser) : this.organiser
			let left
			let right
			let pings
			new Promise((resolve) => {
				if (this.participants.length > 0) {
					this.participants.forEach(async (p, index, array) => {
						p.getIGN().then(IGN => {
							left = `${left || ""}${p.user}\n`
							right = `${right || ""}${IGN}`
							pings = `${pings || ""} ${p.user}`
							if (index === array.length - 1) resolve()
						})
					})
				} else {
					resolve()
				}
			}).then(() => {
				pings = `||${organiser}, ${pings ? pings.trim() : "no one to ping!"}||`
				const embed = new Discord.MessageEmbed()
					.setTitle(this.name)
					.setDescription(`${this.name} starts in 10 minutes, all below players should get ready`)
					.addField("Organiser", organiser)
					.addField("Discord users", left || "No one registered", true)
					.addField("Minecraft IGNs", right || "No one registered", true)
					.setColor("RANDOM")
					.setTimestamp(this.date)
					.setFooter(announChannel.guild.name, announChannel.guild.iconURL())
				announChannel.send(embed).then(() => {
					announChannel.send(pings)
					setTimeout(() => {
						announChannel.send(`${this.name} has started!`)
					}, 600000) // 600000 ms = 10 mins
				})
			})
		}

		get written() {
			return this.id ? true : false
		}

		get canJoin() {
			const date = new Date()
			date.setMinutes(date.getMinutes() + 12)
			return (this.date ? this.date > date : true) && (this.max ? this.participants.length < this.max : true)
		}

		isListed(Player) {
			return this.participants.find(pnt => pnt.minecraftUUID === Player.minecraftUUID) ? true : false
		}

		getParticipant(Player) {
			return this.participants.find(pnt => pnt.minecraftUUID === Player.minecraftUUID)
		}

		writeE() {
			return new Promise((resolve, reject) => {
				if (this.written) {
					client.db.all(`UPDATE events SET name = $name, date = $date, max = $max WHERE eventID = $eventID`, {
						$name: this.name,
						$date: this.date ? this.date.getTime() : null,
						$max: this.max,
						$eventID: this.id
					}, (err, out) => {
						if (err) {
							reject(err)
							return
						}
						resolve(this)
					})
				} else {
					client.db.all(`INSERT INTO events(name, date, max, organiser) VALUES($name, $date, $max, $organiser)`, {
						$name: this.name,
						$date: this.date ? this.date.getTime() : null,
						$max: this.max,
						$organiser: this.organiser
					}, (err, out) => {
						if (err) {
							reject(err)
							return
						}
						client.db.all(`SELECT * FROM events WHERE name = $name`, {
							$name: this.name,
						}, (err, rows) => {
							if (err) {
								reject(err)
								return
							}
							const row = rows[rows.length - 1]
							this.id = row.eventID
							resolve(this)
						})
					})
				}
			})
		}

		writePs() {
			return new Promise((resolve, reject) => {
				if (this.written) {
					client.db.all(`DELETE FROM participants WHERE eventID = $eventID`, {
						$eventID: this.id
					})
					this.participants.forEach((EventParticipant) => {
						EventParticipant.written = false
					})
					this.participants.forEach((EventParticipant, index, array) => {
						EventParticipant.write().then(() => {
							if (index === array.length - 1) {
								resolve()
							}
						})
					})
				} else {
					reject(new Error(`Event ${this.id} is not written, could not register participants`))
				}
			})
		}

		write() {
			return new Promise((resolve, reject) => {
				this.writeE().then(() => {
					this.writePs().then(() => {
						resolve()
					})
				})
			})
		}

		addParticipant(Player) {
			this.participants.push(new client.EventParticipant(this, Player))
			return this
		}
	}

	client.EventParticipant = class EventParticipant extends client.Player {
		constructor(Event, Player, written) {
			super(Player.discordID, Player.minecraftUUID)
			this.event = Event
			this.joinDate = new Date()

			this.written = written || false
		}

		write() {
			if (!this.written) {
				return new Promise((resolve, reject) => {
					client.db.all(`INSERT INTO participants(eventID, discordID, minecraftUUID) VALUES($eventID, $discordID, $minecraftUUID)`, {
						$eventID: this.event.id,
						$discordID: this.discordID,
						$minecraftUUID: this.minecraftUUID
					}, (err, out) => {
						if (err) {
							reject(err)
							return
						}
						this.written = true
						resolve()
					})
				})
			}
		}

		setJoin(Date) {
			this.joinDate = Date
			return this
		}

		leave() {
			const index = this.event.participants.findIndex(p => p.discordID === this.discordID)
			this.event.participants.splice(index, 1);
			delete this
			return null
		}
	}
	client.HypixelKeyManager = class HypixelKeyManager {
		constructor() {
			this.index = 0
			this.keys = []
			this.keymap = new Map()
		}
		/**
		 * Returns the last index of the keys array
		 */
		get maxIndex() {
			return this.keys.length - 1
		}

		/**
		 * Returns the amount of keys registered
		 */
		get length() {
			return this.keys.length
		}

		/**
		 * Adds an api key to the manager's array
		 * @param {string} key - The hypixel api key to add 
		 */
		add(key) {
			const thing = new Hypixel({
				key: key
			});
			const index = this.keys.push(thing)
			this.keymap.set(key, index)
		}

		/**
		 * Removes an api key from the manager's array
		 * @param {string} key - The hypixel api key to remove
		 */
		remove(key) {
			const index = this.keymap.get(key)
			if (index) {
				this.keys.splice(index, 1)
				this.keymap.delete(key)
			}
		}
		/**
		 * Returns the next key
		 */
		next() {
			this.index++
			if (this.index > this.maxIndex) {
				this.index = 0
			}
			return this.keys[this.index]
		}
		/**
		 * Returns the previous key
		 */
		previous() {
			this.index--
			if (this.index < 0) {
				this.index = this.maxIndex
			}
			return this.keys[this.index]
		}
	}
}