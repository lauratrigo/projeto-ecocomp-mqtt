const bcrypt = require("bcrypt");
const userDAO = require("../dao/userDAO");
const deviceDAO = require("../dao/deviceDAO");

class AuthService {
    async registerUser({ name, email, password, deviceId }) {
        const userExists = await userDAO.findByEmail(email);
        if (userExists) {
            const error = new Error("Email ja cadastrado");
            error.statusCode = 400;
            throw error;
        }

        const device = await deviceDAO.findByDeviceId(deviceId);
        if (!device) {
            const error = new Error("Estufa invalida");
            error.statusCode = 400;
            throw error;
        }

        const deviceAlreadyLinked = await userDAO.findByDeviceId(deviceId);
        if (deviceAlreadyLinked) {
            const error = new Error("Esta estufa ja esta vinculada a outro usuario");
            error.statusCode = 400;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await userDAO.create({
            name,
            email,
            password: hashedPassword,
            devices: [device.deviceId]
        });
    }

    async loginUser({ email, password }) {
        const user = await userDAO.findByEmail(email);
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

    async resetPassword({ email, newPassword }) {
        const user = await userDAO.findByEmail(email);

        if (!user) {
            const error = new Error("Usuario nao encontrado");
            error.statusCode = 400;
            throw error;
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await userDAO.save(user);
    }
}

module.exports = new AuthService();
