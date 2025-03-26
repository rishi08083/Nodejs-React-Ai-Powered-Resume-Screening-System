exports.getHomeController = (req, res) => {
    const response = {
        message: 'Welcome to the ATS API',
        type: "success"
    };
    res.status(200).json(response);
};

