const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    cart:{
        type:Array,
        required:true
    },
    shippingAddress:{
        type:String,
        required:true
    },
    user:{
        type:Object,
        required:true
    },
    totalPrice:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        default:"processing"
    },
    paymentInfo:{
        id:{
            type:String,
        },
        status:String,
        type:String,
    },
    paidAt:{
        type:Date,
        default:new Date(),
    },
    deliveredAt:{
        type:Date,
    },
    createdAt:{
        type:Date,
        default:new Date(),
    }
})

module.exports = mongoose.model("Order",orderSchema)