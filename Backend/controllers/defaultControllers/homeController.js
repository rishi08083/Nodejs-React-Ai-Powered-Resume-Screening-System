exports.getHomeController = (req, res) => {
    const response = {
        status: "success",
        message: "Welcome to the ATS API",
        data: {}
    };
    res.status(200).json(response);
};
