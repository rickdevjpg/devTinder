const express=require('express');
const connectDB=require("./config/database");
const app=express();
const cookieParser=require("cookie-parser");
const cors=require('cors')

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));



//middleware to convert the json to js object which the server understands
app.use(express.json());  
//middleware to parse all the cookies
app.use(cookieParser());



const authRouter=require('./routes/auth');
const profileRouter=require("./routes/profile");
const requestRouter=require("./routes/request");
const userRouter = require('./routes/user');
 
app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);










connectDB()
.then(()=>{
    console.log(("databasew connection established"));
    
    app.listen(3000,()=>{
        console.log("hello");
        
    });
    

})
.catch(err=>{
    console.error("database connection cannot be establised");
    
})





