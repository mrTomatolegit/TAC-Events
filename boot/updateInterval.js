const { PlayerUpdater } = require("../EventsAPI")

exports.load = (client, reload) => {
    if (reload) {
        return
    }

    const schedule = require("node-schedule")
    client.updateJob = schedule.scheduleJob("updateJob","0 */4 * * *", async () => {
        const playerUpdater = new PlayerUpdater(client)

        playerUpdater.updateAll()
    })
}