function validateReading(req, res, next) {
    if (!req.body.deviceId) {
        return res.status(400).json({ erro: "deviceId nao informado" });
    }

    return next();
}

function validateReadingQuery(req, res, next) {
    if (!req.query.deviceId) {
        return res.status(400).json({ erro: "deviceId nao informado" });
    }

    return next();
}

module.exports = {
    validateReading,
    validateReadingQuery
};
