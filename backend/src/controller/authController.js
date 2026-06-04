const authService = require("../service/authService");

class AuthController {
    async register(req, res) {
        try {
            await authService.registerUser(req.body);
            return res.json({ message: "Usuario criado com sucesso" });
        } catch (error) {
            if (error.statusCode === 400) {
                return res.status(400).json({ erro: error.message });
            }

            console.error("ERRO REGISTER:", error);
            return res.status(500).json({
                erro: "Erro interno no servidor",
                detalhe: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const user = await authService.loginUser(req.body);
            res.json({ message: "Login OK", user });
        } catch (error) {
            if (error.statusCode === 400) {
                return res.status(400).json({ erro: error.message });
            }

            return res.status(500).json({ erro: "Erro no login" });
        }
    }

    async resetPassword(req, res) {
        try {
            await authService.resetPassword(req.body);
            res.json({ message: "Senha alterada com sucesso" });
        } catch (error) {
            if (error.statusCode === 400) {
                return res.status(400).json({ erro: error.message });
            }

            console.error(error);
            return res.status(500).json({ erro: "Erro ao alterar senha" });
        }
    }
}

module.exports = new AuthController();
