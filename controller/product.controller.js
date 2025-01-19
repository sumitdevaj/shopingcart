const express = require('express');
const Shop = require('../model/shop.model');
const ErrorHandler = require('../utils/ErrorHandler');
const Product = require('../model/product.model');
const Order = require('../model/order.model');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();



router.post("/create-product",async(req,res,next)=>{
    try{
        const {shopId,productData} = req.body;
        const shop = await Shop.findById(shopId);
        productData.shop =shop
        if(!shop){
            return next(new ErrorHandler("shop not found",400))
        }
        const product = await Product.create(productData)
        res.send({
            status:true,
            product

        })

        

    }
    catch(err){

    }
})

router.get('/get-all-products-shop/:id', async(req,res,next)=>{
    try{
        const products = await Product.find({shopId: req.params.id})
        res.send({
            success: true,
            products
        })
    }
    catch(err){
        console.log(err);
        return next(new ErrorHandler(err.message,500));
        

    }
})

router.delete('/delete-shop-product/:id',async(req,res,next)=>{
    try{
        const products = await Product.findById({shopId: req.params.id});
        if(!products){
            return next(new Error("Product not found", 404));
        }
        await Product.remove()

        res.send({
            status: 200,
            message: "Product removed successfully"
        })

    }
    catch(err){
        console.log(err);
        return next(new ErrorHandler(err.message,500));
        
    }
})

router.get("/get-all-products", async(req, res,next)=>{
    try{
        const products = await Product.find().sort({createdAt:-1})

        res.send({
            success:true,
            products: products
        })

    }
    catch(err){
        return next(new ErrorHandler(err.message,500))
    }
})

router.put("/create-new-review", async(req, res, next)=>{
    try{
        const {user,rating,comment,productId,orderId} = req.query;
        const product = await Product.findById(productId);
        const review = {
            user,
            rating,
            comment,
            productId,
        }
        const isReviewed = product.reviews.find((rev)=>rev.user._id === req.user._id)
        if(!isReviewed) {
            product.reviews.forEach((review)=>{
                if(review.user._id === req.user._id){
                (review.rating =rating),(review.comment =comment),(review.user=user)
                }
            })
        }
        else{
            product.reviews.push(review)
        }
        let avg = 0;
        product.reviews.forEach((review)=>{
            avg+=review.rating;
        });
        product.rating = avg/product.reviews.length;
        await Product.save({validateBeforeSave: false});
        // order details  incomplete 
        await Order.findByIdAndUpdate(orderId,{$set:{"cart.${elem}.isReviewed":true}},{arrayFilters:[{"elem._id":prouctId}],new:true})
        res.status(200).json({
            success: true,
            message:"reviewed successfully"
        })
    }
    catch(err){
        console.log(err);
        return next( new ErrorHandler(err.message,500));
        
    }
})

router.get('/admin-all-product',isAuthenticated,isAdmin('Admin') ,async (req, res, next) => {
    try{
        const products = await Product.find().sort({createdAt:-1})
        res.send({
            status: true,
            products: products
        })
    }
    catch(err){

    }
})


module.exports = router