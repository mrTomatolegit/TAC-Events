const HypixelKeyManager = require("./src/managers/HypixelKeyManager");

module.exports = {
    // Client
    Client: require("./src/client/Client"),

    // Classes
    Event: require("./src/classes/Event"),
    Participant: require("./src/classes/Participant"),
    Player: require("./src/classes/Player"),
    Announce: require("./src/classes/Announce"),
    Guild: require("./src/classes/Guild"),

    // Managers
    EventManager: require("./src/managers/EventManager"),
    PlayerManager: require("./src/managers/PlayerManager"),
    ParticipantManager: require("./src/managers/ParticipantManager"),
    SettingsManager: require("./src/managers/SettingsManager"),
    AnnounceManager: require("./src/managers/AnnounceManager"),
    HypixelKeyManager: require("./src/managers/HypixelKeyManager"),
    GuildManager: require("./src/managers/GuildManager")
}