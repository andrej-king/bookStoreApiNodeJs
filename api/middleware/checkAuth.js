const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // format: Bearer tokenId
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;

        next(); // if success return data
    } catch (error) {
        return res.status(401).json({
           message: 'Auth failed'
        });
    }
}