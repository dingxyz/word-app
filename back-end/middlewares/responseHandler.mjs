export const responseHandler = (req, res, next) => {
    res.sendSuccess = (data = {}) => {
        res.send({
            code: '000000',
            data,
        });
    };

    res.sendError = (message) => {
        res.send({
            code: '999999',
            message,
        });
    };

    next();
};
