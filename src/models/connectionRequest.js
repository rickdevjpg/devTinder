
const mongoose=require("mongoose");

const connectionRequestSchema=new mongoose.Schema({
    fromUserId:{

        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"  //reference to the User Collection


    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    status:{
        type:String,
        required:true, 
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is incorrect status type`,
          },
        
    }



},
{timestamps:true});

connectionRequestSchema.index({fromUserId:1,toUserId:1});


//pre will be called everytime the connection request will be saved..whenever the save method will be called
connectionRequestSchema.pre("save",function (next){
    const connectionRequest=this;
    //check if fromUserId is same as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId))
    {
        throw new Error("Cannot send connection request to yourself")
    }
    next();

})




const connectionRequestModel=new mongoose.model("ConnectionRequest",connectionRequestSchema);


module.exports=connectionRequestModel;