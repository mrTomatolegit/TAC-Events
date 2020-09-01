const { SmartSearch } = require("../EventsAPI")

module.exports = (client, newMember) => {
    if (newMember.partial) return
    const smartSearch = new SmartSearch(client)

    smartSearch.singleSearch(newMember)
}