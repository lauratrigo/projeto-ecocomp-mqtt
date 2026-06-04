const User = require("../model/User");

class UserDAO {
    async findByEmail(email) {
        return User.findOne({ email });
    }

    async findByDeviceId(deviceId) {
        return User.findOne({ devices: deviceId });
    }

    async create(data) {
        return new User(data).save();
    }

    async save(user) {
        return user.save();
    }
}

module.exports = new UserDAO();
