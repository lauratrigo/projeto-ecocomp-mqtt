function errorHandler(error, req, res, next) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Erro interno no servidor";

    res.status(statusCode).json({ erro: message });
}

module.exports = errorHandler;
