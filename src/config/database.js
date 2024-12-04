const mongoose=require("mongoose");
const connectDB=async()=>{
    await mongoose.connect("mongodb+srv://rickchakraborty437:ricky@ricky.ew9mc.mongodb.net/devTinder");
}

module.exports=connectDB;

