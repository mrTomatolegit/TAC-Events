const Hypixel = require("hypixel")

class HypixelKeyManager {
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
     * @returns {string}
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
     * @returns {string}
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

module.exports = HypixelKeyManager