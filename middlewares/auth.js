const jwt = require("jsonwebtoken")
const {getErrorResponse} = require('../util/helper')
module.exports = (req, res, next) => {
    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    try {
        const token = req.header(tokenHeaderKey);
        const verified = jwt.verify(token, jwtSecretKey);
        if(verified){
           res.user_id = verified.user_id
           next();
           return false
        }else{
            // Access Denied
            let data = getErrorResponse("unauthorized access")
            return res.status(401).send(data);
        }
    } catch (error) {
        console.log("error", error);
        // Access Denied
        let data = getErrorResponse("unauthorized access")
        return res.status(401).send(data);
    }
}