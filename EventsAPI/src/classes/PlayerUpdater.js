const { MessageEmbed } = require("discord.js");

class PlayerUpdater {
    constructor(client) {
        this.client = client

        this.updatedPlayers = 0;
        this.playerSize = client.players.size;
    }

    get finished () {
        return this.updatedPlayers >= this.playerSize
    }

    get embed() {
        let embed = new MessageEmbed()
            .setTitle("Nickname and role updater")
            .setDescription(`Updated players: ${this.updatedPlayers}/${this.playerSize}`)
            .setColor(this.finished ? "GREEN" : "ORANGE")
            .setFooter("Dont crash pls")
        return embed
    }

    async updateAll() {
        for (let player of this.client.players) {
            let value = player[1]

            await value.update()
            this.updatedPlayers++
            await new Promise((resolve) => setTimeout(() =>{resolve()}, 500))
        }
    }
}

module.exports = PlayerUpdater