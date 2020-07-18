exports.load = (client, reload) => {
    if (reload) {
        return
    }
    exports.update = async () => {
        client.players.forEach(async player => {
            await player.update()
        })
    }

    const schedule = require("node-schedule")
    client.updateJob = schedule.scheduleJob("updateJob","0 */4 * * *", async () => {
        this.update()
    })
}