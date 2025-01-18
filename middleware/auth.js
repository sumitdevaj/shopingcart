const Shop = require("../model/shop.model");
const User = require("../model/user.model");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async(req, res, next)=>{
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler("Please login to continue.",400));
    }
    const decoded = jwt.verify(token, process.env.JWT_SCRET_KEY);
    console.log(decoded);
    
     req.user = await User.findById(decoded.id) 
     next()
}
exports.isSeller = async(req, res, next)=>{
    const {seller_token} = req.cookies;
    if(!seller_token){
        return next(new ErrorHandler("Please login to continue.",400));
    }
    const decoded = jwt.verify(seller_token, process.env.JWT_SCRET_KEY);
    req.seller = await Shop.findById(decoded.id) 
    console.log({decoded});
    
    next()
}