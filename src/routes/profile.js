const express=require('express');
const {userAuth}=require("../middlewares/auth");
const {validateEditProfileData}=require("../utils/validadtion");
const User=require("../models/user");
const bcrypt=require("bcrypt");

const profileRouter=express.Router();

profileRouter.get("/profile/view",userAuth,async(req,res)=>{
    try{
     const user=req.user;
     res.send(user);
 
    }catch(err)
    {
     res.status(400).send("ERROR:"+err.message);
 
    }
 });

 profileRouter.patch("/profile/edit",userAuth,async(req,res)=>{


    try{

        if(!validateEditProfileData(req))
        {
           throw new Error("Invalid edit request");
        }


        const loggedInUser=req.user;

        //this loop will run for all the keys in the request
        Object.keys(req.body).forEach(key=>loggedInUser[key]=req.body[key]);


       await loggedInUser.save();


        res.json({message:`${loggedInUser.firstName},your profile was edited successfully`,data:loggedInUser});


        


}
catch(err)
{
res.status(400).send("ERROR: "+err.message);
}

 });

 profileRouter.patch("/profile/edit/password",userAuth,async(req,res)=>{

    try{
        const {emailId,password,newPassword}=req.body;

    const user=await User.findOne({emailId:emailId});
    if (!user) {
        return res.status(404).send("User not found");
      }

    const isPasswordValid=await bcrypt.compare(password,user.password);

    
    if(!isPasswordValid){
        throw new Error("invalid password");
    }

    const hashedPassword=await bcrypt.hash(newPassword,10);

    user.password=hashedPassword;
    await user.save();

    res.send("password updated successfully");


}catch(err)
{
    res.status(400).send("ERROR: "+err.message);
}

 })



 module.exports=profileRouter;