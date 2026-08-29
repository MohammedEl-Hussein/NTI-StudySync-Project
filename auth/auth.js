const jwt=require("jsonwebtoken");
const auth = async(req,res,next) => {
    const {authorization}=req.headers;
    if(!authorization){
        return res.status(401).json({
            message: "please login first"
        })
    }
    try{
        const token = authorization.split(" ")[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next()
    }catch (err){
        return res.status(401).json({
            message:"please login first"
        })
    }
}
module.exports = auth;