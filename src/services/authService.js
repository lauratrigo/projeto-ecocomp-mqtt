const bcrypt = require("bcrypt");
const User = require("../models/User");
const Device = require("../models/Device");

async function registerUser({ name, email, password, deviceId }) {
    if (!deviceId) {
        const error = new Error("deviceId nao enviado");
        error.statusCode = 400;
        throw error;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        const error = new Error("Email ja cadastrado");
        error.statusCode = 400;
        throw error;
    }

    const device = await Device.findOne({ deviceId });
    if (!device) {
        const error = new Error("Estufa invalida");
        error.statusCode = 400;
        throw error;
    }

    const deviceAlreadyLinked = await User.findOne({ devices: deviceId });
    if (deviceAlreadyLinked) {
        const error = new Error("Esta estufa ja esta vinculada a outro usuario");
        error.statusCode = 400;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
        name,
        email,
        password: hashedPassword,
        devices: [device.deviceId]
    });

    await user.save();
}

async function loginUser({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error("Usuario nao encontrado");
        error.statusCode = 400;
        throw error;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        const error = new Error("Senha incorreta");
        error.statusCode = 400;
        throw error;
    }

    return {
        id: user._id,
        name: user.name
    };
}

async function resetPassword({ email, newPassword }) {
    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error("Usuario nao encontrado");
        error.statusCode = 400;
        throw error;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
}

module.exports = {
    loginUser,
    registerUser,
    resetPassword
};
