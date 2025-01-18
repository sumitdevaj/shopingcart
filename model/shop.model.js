const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const shopSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    address:{
        type:String
    },
    avatar:{
        public_id:String,
        url:String
    },
    withdrawal:{
        type:Object,
    },
    zipCode:{
        type:Number,
    },
    avaiableBalance:{
        type:Number,
        defaultValue:0
    },
    transactions:[{
        amount:{
            type:Number,
            required:true,
        },
        status:{
            type:String,
            defaultValue:"processing",
        },
        createdAt:{
            type:Date,
            defaultValue: Date.now()
        },
        updatedAt:{
            type:Date,
            defaultValue:Date.now()
        }
    }],
    createdAt:{
        type:Date,
        defaultValue:Date.now()
    },
    resetPasswordToken: String,
    resetPasswordTime:Date

})

shopSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password,10);
})

shopSchema.methods.getJwtToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SCRET_KEY,{
        expiresIn:process.env.JWT_EXPIRES
    })
}

shopSchema.methods.comparePassword = async function(enterPassword){
    return await bcrypt.compare(enterPassword,this.password)
}

module.exports =mongoose.model("shop",shopSchema);