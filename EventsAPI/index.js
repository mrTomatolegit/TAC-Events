module.exports = {
    // Client
    Client: require("./src/client/Client"),

    // Classes
    Event: require("./src/classes/Event"),
    Participant: require("./src/classes/Participant"),
    Player: require("./src/classes/Player"),
    Announce: require("./src/classes/Announce"),

    // Managers
    EventManager: require("./src/managers/EventManager"),
    PlayerManager: require("./src/managers/PlayerManager"),
    ParticipantManager: require("./src/managers/ParticipantManager"),
    SettingsManager: require("./src/managers/SettingsManager"),
    AnnounceManager: require("./src/managers/AnnounceManager")
}