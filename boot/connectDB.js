exports.load = (client, reload) => {
    if (reload) {
        return
    }

    const sqlite = require("sqlite3")
    client.db = new sqlite.Database("./data/TAC-Events.db")

    client.registerUser = (ID, UUID) => {
        return new Promise((resolve, reject) => {
            client.db.all("INSERT INTO registry(ID, UUID) VALUES($ID, $UUID)", {$ID: ID, $UUID: UUID}, (err, out) => {
                if (err) {
                    client.error(err)
                    reject(err)
                    return
                }
                resolve(out)
            })
        })
    }

    client.getUUID = (ID) => {
        return new Promise((resolve, reject) => {
            client.db.all("SELECT * FROM registry WHERE ID = $ID", {$ID: ID}, (err, out) => {
                if (err) {
                    client.error(err)
                    reject(err)
                    return
                }
                if (!out || out.length < 1) {
                    resolve(null)
                    return
                }
                resolve(out[0].UUID)
            })
        })
    }

    client.getID = (UUID) => {
        return new Promise((resolve, reject) => {
            client.db.all("SELECT * FROM registry WHERE UUID = $UUID", {$UUID: UUID}, (err, out) => {
                if (err) {
                    client.error(err)
                    reject(err)
                    return
                }
                if (!out || out.length < 1) {
                    resolve(null)
                    return
                }
                resolve(out[0].ID)
            })
        })
    }

    client.deleteUser = (provided) => {
        return new Promise((resolve, reject) => {
            client.db.all("DELETE FROM registry WHERE UUID = $UUID OR ID = $ID", {$UUID: provided, $ID: provided}, (err, out) => {
                if (err) {
                    client.error(err)
                    reject(err)
                    return
                }
                resolve(out)
            })
        })
    }

}