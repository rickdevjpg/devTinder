const express=require('express');

//we are creating an instance a new express js application
const app=express();

//req handler
app.use('/test',(req,res)=>{
    res.send("hello from the server");

})

app.use('/hello',(req,res)=>{
    res.send("hello heloooooo magiii halo");

})



app.listen(3000,()=>{
    console.log("hello");
    
});


