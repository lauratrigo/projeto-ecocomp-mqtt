const mongoose = require("mongoose");

class User {
    constructor(data) {
        Object.assign(this, data);
    }
}

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    devices: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
