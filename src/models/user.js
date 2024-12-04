const mongoose=require('mongoose');
const validator=require("validator");
const jwt=require("jsonwebtoken");
const bcrypt=require('bcrypt');

const userSchema=new mongoose.Schema({
firstName: {
    type:String,
    required:true,
    minLength:4,
    maxLength:50,
    index:true
},
lastName:{
    type:String
},
emailId:{
    type:String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate(value){
        if(!validator.isEmail(value))
        {
            throw new Error("invalid email address"+value);

        }
    }


},
password:{
    type:String,
    required:true,
    validate(value){
        if(!validator.isStrongPassword(value))
        {
            throw new Error("weak password");
        }
    }

},
age:{
    type:Number,
    min: 18
}, 
gender:{
    type:String,
    enum:{
        values:["male","female","others"],
        message:"{VALUE} IS NOT VALID gender type"
    },
    validate(value){
        if(!["male","female","others"].includes(value))
        {
            throw new Error("gender data is not valid");

        }
    }
},
photoUrl:{
    type:String,
    default:"https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG.png",
    validate(value){
        if(!validator.isURL(value))
            throw new Error("invalid photo url:"+value);
    }
},
about:{
    type:String,
    default:"this is a default about of the user"
},
skills:{
    type:[String],
}

},{
    timestamps:true,
});

userSchema.index({firstName:1,lastName:1});


//we cannot use arrow function here 
userSchema.methods.getJWT=async function(){
    const user=this;
   const token=await jwt.sign({_id:user._id},"DEV@Tinder$790",{expiresIn:'7d',});
   return token;
}
userSchema.methods.validatePassword=async function(passwordInputByUser)
{
    const user=this;

    const passwordHash=user.password;

    const isPasswordValid=await bcrypt.compare(passwordInputByUser,passwordHash);
   return isPasswordValid;
}

const userModel=mongoose.model("User",userSchema);

module.exports=userModel;
