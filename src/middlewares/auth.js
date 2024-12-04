const jwt=require("jsonwebtoken");
const User=require("../models/user");
const userAuth=async(req,res,next)=>{


    try
   { //read the token from the req cookies 
    //validate the token and find the user

    const cookies=req.cookies;
    
    const {token}=cookies;
    if(!token)
    {
        //it means that you are unauthorized
        return res.status(401).send("Please Login");
    }

    const decodedObj=await jwt.verify(token,"DEV@Tinder$790");

    const {_id}=decodedObj;
    const user=await User.findById(_id);

    if(!user)
    {
        throw new Error("User not found");
    }
    req.user=user;
    //if authorization is valid..more to the request handler
    next();
    }catch(err)
    {
        res.status(400).send("ERROR:"+err.message);

    }

}

module.exports={
    userAuth
}