const jwt=require("jsonwebtoken");
const auth = async(res,req,next) => {
    const {authorization}=req.headers;
    if(!authorization){
        return res.status(401).json({
            message: "please login first"
        })
    }
    try{
        const token = authorization.split(" ")[1];
        const decode = jwt.verify(token,"this is my secret key");
        req.user = decode;
    }catch (err){
        return res.status(401).json({
            message:"please login first"
        })
    }
}
module.exports = auth;