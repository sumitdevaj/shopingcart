const express = require('express');
const Shop = require('../model/shop.model');
const ErrorHandler = require('../utils/ErrorHandler');
const Product = require('../model/product.model');
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

module.exports = router