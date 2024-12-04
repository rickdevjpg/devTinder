const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const ConnectionRequest=require("../models/connectionRequest");
const User=require("../models/user");

const USER_SAFE_DATA="firstName lastName photoUrl age gender about skills"

//get all the pending connection request for the logged in user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests=await ConnectionRequest.find(
        {toUserId:loggedInUser._id,status:"interested"}
    )
    //.populate("fromUserId",["firstName","lastName"]);  both are same just one is with array another is with string
    .populate("fromUserId",USER_SAFE_DATA);



     

    res.json({message:"Data fetched successfully",
        data:connectionRequests
    });











  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections",userAuth,async(req,res)=>{
    try{
        const loggedInUser=req.user;

        const connectionRequests=await ConnectionRequest.find({
            status:"accepted",
            $or:[{fromUserId:loggedInUser._id},{toUserId:loggedInUser._id}]
        }).populate("fromUserId",USER_SAFE_DATA)
        .populate("toUserId",USER_SAFE_DATA);
        ;

        const data=connectionRequests.map((row)=>{
            if(row.fromUserId._id.toString()===loggedInUser._id.toString())
           return  row.toUserId;

            return row.fromUserId;
        
        });

        res.json({data});



    }catch(err)
    {
        res.status(400).send("ERROR: "+err.message);

    }
});

userRouter.get("/user/feed",userAuth,async(req,res)=>{
    try{


        //pagination for showing only 10 users on feed at a time
        const page=parseInt(req.query.page)|| 1;
        let limit=parseInt(req.query.limit)|| 10;
        limit=limit>50?50:limit;


        const skip=(page-1)*limit;



        //user should see all the user cards except---
        //0.his own card
        //1.his connections
        //2.ignored people
        //3.already sent the connection request

        //example:rahul = [rick elon mark donald ms virat]
        //rahul->rick->rejected rahul->elon->accepted

        const loggedInUser=req.user;
        //find all connection request that i have sent or received
        const connectionRequests=await ConnectionRequest.find({
            $or:[{fromUserId:loggedInUser._id},{toUserId:loggedInUser._id}]
        })
        .select("fromUserId toUserId");
        // .populate("fromUserId","firstName")
        // .populate("toUserId","firstName");

        //it will only have unique entries
        const hideUsersFromFeed=new Set();
        connectionRequests.forEach((req)=>{
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });

        const users=await User.find({
           $and:[{ _id:{$nin: Array.from(hideUsersFromFeed)}},
            {_id:{$ne:loggedInUser._id}}]
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        
        



        res.json({data:users});


    }catch(err)
    {
        res.status(400).send("ERROR: "+err.message);
    }
})


module.exports = userRouter;
