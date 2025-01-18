const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type:'String',
        required:[true,"please enter a name"]
    },
    email:{
        type:'String',
        required:[true,"please enter a email"]
    },
    password:{
        type:'String',
        required:[true,"please enter a password"],
        minLength:[4,"password must be at least 4 characters"],
        select:false
    },
    phoneNumber:{
        type:"Number",
        required:[true,"please enter a phone number"],
    },
    addresses:[
        {
            country:{
                type:String
            },
            city:String,
            address1:String,
            address2:String,
            zipCode:Number,
            addressType:String,
        }
    ],
    role:{
        type:String
    },
    avatar:{
        public_id:String,
        url:String
    },
    resetPasswordToken:String,
    resetPasswordToken:Date
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password,10);
})

// jwt token 
userSchema.methods.getJwtToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SCRET_KEY,{
        expiresIn:process.env.JWT_EXPIRES
    })
}
userSchema.methods.comparePassword = async function(enterPassword){
    return await bcrypt.compare(enterPassword,this.password)
}

module.exports = mongoose.model('User',userSchema);