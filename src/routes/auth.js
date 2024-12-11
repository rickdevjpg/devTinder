
const express=require('express');
const bcrypt=require("bcrypt");
const {validateSignUpData}=require("../utils/validadtion");
const User=require("../models/user");
const validator=require("validator");

const authRouter=express.Router();

authRouter.post("/signup",async(req,res)=>{


   
    try{
    //validadtion of data

    validateSignUpData(req);

    const {firstName,lastName,emailId,password,age,gender,photoUrl,about,skills}=req.body;

    //encrypt the password
    const passwordHash=await bcrypt.hash(password,10);
    const userObj={
        firstName,
        lastName,
        emailId,
        password:passwordHash,
        age
    };
    //creating anew instance of the user model
    const user=new User(userObj);

       const savedUser= await user.save();
       const token=await savedUser.getJWT();
       res.cookie("token",token,{expires:new Date(Date.now()+100*3600000),})
        res.json({message:"User added successfully",data:savedUser});
    }catch(err)
    {
        res.status(400).send("ERROR :"+err.message);

    }






     
});

authRouter.post("/login",async(req,res)=>{
    try{

        const {emailId,password}=req.body;

        //sanitizing the email

        if(!validator.isEmail(emailId))
        {
            throw new Error("invalid email Id");
        }

        //check if emailId is present in DB or not
        const user=await User.findOne({emailId: emailId});
        if(!user)
        {
            throw new Error("Invalid credentials");
        }



        const isPasswordValid=await user.validatePassword(password);

        if(isPasswordValid)
        {
            //create a JWT token
            const token=await user.getJWT();
            //console.log(token);
            
            //ADD the token to a cookie and send the response to user
            res.cookie("token",token,{expires:new Date(Date.now()+100*3600000),})


            res.send(user);
        }
        else
        {
            throw new Error("Invalid credentials");
        }








    }catch(err)
    {
        res.status(400).send(err.message);

    }
});

authRouter.post("/logout",(req,res)=>{
    
    res.cookie("token",null,{
        expires:new Date(Date.now())
    });
    res.send("LOGGED OUT SUCCESSFULLY");
})



module.exports=authRouter;