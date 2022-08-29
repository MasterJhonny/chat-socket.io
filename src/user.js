class User {
    constructor (id) {
        this.id = id;
        this.name = "User-" + this.id.substring(0, 3);
    }

    getId () {
        return this.id;
    }
    getUserName () {
        return this.name;
    }
}

module.exports = { User };