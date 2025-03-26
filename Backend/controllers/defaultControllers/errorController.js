exports.error404 = (req, res) => {
    const response = {
        message: 'Resource not found',
        type: "error"
    };
    res.status(404).json(response);
}