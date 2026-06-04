function validateRegister(req, res, next) {
    const { name, email, password, deviceId } = req.body;

    if (!name || !email || !password || !deviceId) {
        return res.status(400).json({ erro: "dados obrigatorios nao enviados" });
    }

    return next();
}

function validateLogin(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ erro: "email e senha sao obrigatorios" });
    }

    return next();
}

function validateResetPassword(req, res, next) {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ erro: "email e nova senha sao obrigatorios" });
    }

    return next();
}

module.exports = {
    validateLogin,
    validateRegister,
    validateResetPassword
};
