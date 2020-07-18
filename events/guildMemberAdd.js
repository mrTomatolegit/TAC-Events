const { SmartSearch } = require("../EventsAPI")

module.exports = (client, newMember) => {
    const smartSearch = new SmartSearch(client)

    smartSearch.singleSearch(newMember)
}