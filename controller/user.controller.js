const express = require('express');
const router = express.Router();
const ErrorHandler = require('../utils/ErrorHandler');
const User = require('../model/user.model');
const sendMail = require('../utils/sendMail');
const jwt = require('jsonwebtoken');
const sendToken = require('../utils/sendToken');
const { isAuthenticated } = require('../middleware/auth');


router.post('/create-user',async(req,res,next)=>{
  try {
    const {name,email,password,avatar,phone}= req.body;
    const userEmail = await User.findOne({email});
    if(userEmail){
        return next(new ErrorHandler("User email already exists",400))
    }
    const user = {
        name,email,password,avatar,phoneNumber:phone
    }
    const activationSecret = createActivationToken(user);
    const activationURL = `http://localhost:4000/activation/${activationSecret}`
    // await sendMail({
    //     email: user.email,
    //     subject: "Actiate User Account",
    //     message:`Hello ${user.name} plz click to signup ${activationURL}`,
    // })
    res.send({
      success: true,
      data:activationURL
    })
  }
  catch(err){
    console.log(err);
    
    return next(new ErrorHandler(err.message,500))

  }
})

router.get('/activation/:token', async(req,res)=>{
  console.log(req.params);
  
  if(!req.params.token){
    return next("You must provide a token");
  }
  let data= jwt.verify(req.params.token, process. env.ACTIVATION_SECRET)
  console.log(data);
  
   let d = await User.create(data);
   console.log(await User.find());
   

   res.send({
    success: true,
    message:"user created successfully"
   })
   

})

const createActivationToken = (user)=>{
    return jwt.sign(user,process.env.ACTIVATION_SECRET,{
        expiresIn: '50m'
    })
}

router.post("/login-user", async(req,res,next)=>{
  try{
    let {email,password} = req.body;
    if(!email || !password){
      return next(new ErrorHandler("email is required",400));
    }
    const user = await User.findOne({email: email}).select("+password");
     if(!user){
      return next(new ErrorHandler("user not found",400));
     }
     const isPasswordValid = await user.comparePassword(password)
     if(!isPasswordValid){
      return next(new ErrorHandler("invalid creds",400));
     }
     sendToken(user, 200,res)
     



  }
  catch(err){
    console.log(err);
    return next(new ErrorHandler(err.message,500))
    
  }
})

router.get("/get-user",isAuthenticated,async(req,res,next)=>{
  try{
    const user = await User.findById(req.user.id)
    if(!user){
      return next(new ErrorHandler("user not found",400))
    }
    res.send({
      success: true,
      user
    })

  }
  catch(err){
    console.log(err);
    return next(new ErrorHandler(err.message,500))
    

  }
})

router.get("/logout",async(req,res,next)=>{
  try{
    res.cookie("token",null,{
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
router.put("/update-user-info",async(req,res,next)=>{
  try{
    const {email,password,phoneNumber,name} = req.body;
    const user = new User.findOne({email}).select("+password");
    if(!user){
      return next(new ErrorHandler("user not found",400))
    }
    const isPasswordValid = await user.comparePassword(password);
    if(!isPasswordValid){
      return next(new ErrorHandler("plz provide correct information",400))
    }
    user.name = name;
    user.email=email;
    user.phoneNumber = phoneNumber;
    
    await user.save();
    res.send({
      status:true,
      user
    })
  }
  catch(err){
    return next(new ErrorHandler("err.message",500))
  }
})




module.exports = router;