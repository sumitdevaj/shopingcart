const jwt = require('jsonwebtoken');
const express = require('express');
const Shop = require('../model/shop.model');
const ErrorHandler = require('../utils/ErrorHandler');
// const  createActivationToken  = require('./user.controller');
const sendShopToken = require('../utils/shopToken');
const { isSeller } = require('../middleware/auth');
const router = express.Router();

router.post("/create-shop", async(req,res,next)=>{
    try{
        const {email,name,password,address,phoneNumber,zipCode} = req.body;
        const sellerEmail = await Shop.findOne({email});
        if(sellerEmail) {
            return  next(new ErrorHandler("User already exist",400));
        }
        const seller = {
            name,email,password,address,phoneNumber,zipCode 
        }
        
        const activationToken = createActivationToken(seller)
        res.send({
            success: true,
            message: activationToken,
        })
    }
    catch(err){
        return next(new ErrorHandler(err.message,500));
    }
})

const createActivationToken = (user)=>{
    return jwt.sign(user,process.env.ACTIVATION_SECRET,{
        expiresIn: '50m'
    })
}

router.get('/activation/:token', async(req,res)=>{
  console.log(req.params);
  
  if(!req.params.token){
    return next("You must provide a token");
  }
  let data= jwt.verify(req.params.token, process. env.ACTIVATION_SECRET)
  console.log(data);
  
   let d = await Shop.create(data);
   

   res.send({
    success: true,
    message:"Shop created successfully"
   })
   

})

router.post("/login-shop",async(req,res,next)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return next(new ErrorHandler("You must provide",400))
        }
        const user = await Shop.findOne({email}).select("+password");
        if(!user){
            return next(new ErrorHandler("You must provide",400))
        }
        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid){
            return next(new ErrorHandler("you must provide",400))
        }
        sendShopToken(user,200,res)

    }
    catch(err){
        console.log(err);
        return next(new ErrorHandler(err.message,500))
        

    }
})

router.get("/getSeller",isSeller,async(req,res,next)=>{
    try{
        console.log({Shop});
        
        const seller = await Shop.findById(req.seller._id);
        if(!seller){
            return next(new ErrorHandler("shop not exist",400))
        }
        res.send({
            success: true,
            seller
        })
    }
    catch(err){
        return next(new ErrorHandler(err.message,500))
    }
})

router.get("/logout",async(req,res,next)=>{
    try{
      res.cookie("seller_token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
        sameSite:"none",
        secure:true
      })
      res.status(200).send({
        success: true,
        message: "Logout successfully"
      })
  
    }
    catch(err){
      console.log(err);
      return next(ErrorHandler(err.message,500))
    }
  })

  module.exports = router