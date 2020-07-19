const { SmartSearch } = require("../EventsAPI")

exports.load = (client, reload) => {
    if (reload) {
        return
    }
    const schedule = require("node-schedule")
    client.smartsearchJob = schedule.scheduleJob("smartsearchJob", "0 0 * * */1", () => {
        const smartSearch = new SmartSearch(client)

        smartSearch.globalSearch()
    })
}