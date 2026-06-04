function validateConfig(req, res, next) {
    const { soloMin, tempMax, tempMin } = req.body;

    if (soloMin === undefined || tempMax === undefined || tempMin === undefined) {
        return res.status(400).json({ erro: "configuracao incompleta" });
    }

    return next();
}

module.exports = {
    validateConfig
};
