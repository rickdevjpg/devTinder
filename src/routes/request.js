const express=require('express');
const {userAuth}=require("../middlewares/auth")
const requestRouter=express.Router();
const ConnectionRequest=require("../models/connectionRequest");
const User=require("../models/user");



//can we use the same api for interetsted and ignored by making it dynamic
requestRouter.post("/request/send/:status/:toUserId",userAuth,async(req,res)=>{
   
    try{

        const fromUserId=req.user._id;
        const toUserId=req.params.toUserId;
        const status=req.params.status;

        //validadtion for checking user cannot send request to user himself
        // if(fromUserId==toUserId)
        // {
        //     return res.status(400).send("cannot send request to yourself");
        // }

        //validadtion for checking if the user we are sending request to exists in db or not
        const toUser=await User.findById({_id:toUserId});
        if(!toUser)
        {
            return res.status(400).json({message:"User Not Found"});
        }

        //status validation. this api should be used only for interested and ignored..not rejected and accepted
        const allowedStatus=["ignored","interested"];
        if(!allowedStatus.includes(status))
        {
            return res.status(400).json({message:"INVALID status type: "+status});

        }

        //check if there is an existing connection request
        //there should be no prior req from A to B or B to A
        const existingConnectionRequest=await ConnectionRequest.findOne({
            $or:[{fromUserId: fromUserId,toUserId:toUserId},
                {fromUserId:toUserId,toUserId:fromUserId}]
            
        });

        if(existingConnectionRequest)
        {
            return res.status(400).json({message:"Connection request already present"});
        }





        const connectionRequest=new ConnectionRequest({
            fromUserId,toUserId,status
        });

        const data=await connectionRequest.save();

        res.json({
            message:req.user.firstName+" is "+status+" in "+toUser.firstName,
            data
        })
    }catch(err)
    {
        res.status(400).send("ERROR: "+err.message);
    }

    

});

//receiver side api to accept ot reject the request
requestRouter.post(
    "/request/review/:status/:requestId",
    userAuth,
    async (req, res) => {
      try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;
        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
          return res.status(400).json({ messaage: "Status not allowed!" });
        }
        const connectionRequest = await ConnectionRequest.findOne({
          _id: requestId,
          toUserId: loggedInUser._id,
          status: "interested",
        });
        if (!connectionRequest) {
          return res
            .status(404)
            .json({ message: "Connection request not found" });
        }
        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.json({ message: "Connection request " + status, data });
      } catch (err) {
        res.status(400).send("ERROR: " + err.message);
      }
    }
  );

module.exports=requestRouter;