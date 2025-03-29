exports.error404 = (req, res) => {
    const response = {
        status: "error",
        message: "Resource not found",
        error: {
            details: "The requested resource could not be located on the server."
        }
    };
    res.status(404).json(response);
};