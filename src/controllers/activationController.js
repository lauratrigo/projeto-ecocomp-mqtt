function activate(req, res) {
    const deviceId = req.query.device;

    if (!deviceId) {
        return res.status(400).send("Device invalido");
    }

    return res.redirect(
        `https://lauratrigo.github.io/projeto-ecocomp/cadastro.html?device=${deviceId}`
    );
}

module.exports = {
    activate
};
