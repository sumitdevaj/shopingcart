const ErrorHandler = require('../utils/ErrorHandler');
module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    if(err.name === "CastError"){
        const message= `Resource not found with this id ${err.path}`
        err= new ErrorHandler(message,400);

    }
    if(err.code === 11000){
        const message = `Duplicate key ${Object.keys(req.keyValue)} entered`
        err = new ErrorHandler(message,400);
    }
    if(err.name === 'JsonWebTokenError'){
        const message = `your url is invalid  please try again `
        err = new ErrorHandler(message,400);
    }
    if(err.name === 'TokenExpiredError'){
        const message =   `Your Url is Expired `
        err = new ErrorHandler(message,400);
    }
    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}