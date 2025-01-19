const express = require('express');
const ErrorHandler = require('../utils/ErrorHandler');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();


router.post('/create-order',async (req,res,next) => {
    try{
        const {cart , shippingAddress, user, totalPrice, paymentInfo}= req.body;
        const shopItemsMap = new Map();
        for(const item of cart){
            const shopId = item.shopId;
            if(!shopItemsMap.has(shopId)){
                shopItemsMap.set(shopId,[]);
            }
            shopItemsMap.get(shopId).push(item)
        } 
        const orders =[];
        for (const [shopId, items] of shopItemsMap){
            const order =await Order.create({
                cart:items,
                shippingAddress,
                user,
                totalPrice,
                paymentInfo
            })
            orders.push(order);
        }
        res.send({
            success:true,
            order:orders
        })
    }
    catch(err){
        console.log(err);
        return next(new ErrorHandler(err.message,500))
        

    }
})

router.get('/get-all-orders/:userId',async (req,res,next)=>{
    try{
        const orders = await Order.find({"user._Id":req.params.userId}).sort({
            createdAt:-1
        })
        res.send({
            success: true,
            orders
        })
    }
    catch(err){
        console.log(err);
        return next(new ErrorHandler(err.message,500))

    }
})

router.get('/get-seller-all-orders/:shopId',async (req,res,next)=>{
    try{
        const orders = await Order.find({
            "cart.shopId":req.params.shopId
        }).sort({createdAt:-1})
        res.send({
            success:true,
            orders
        })
    }
    catch(err){
        console.log(err);
        return next(new ErrorHandler(err.message,500))

    }
})

router.put("/update-order-status/:id",async (req,res,next)=>{
    try{
        const order = await Order.findById(req.params.id);
        if(!order){
            return next(new ErrorHandler(err.message,500))
        }
        if(req.body.status === "transferred to delivery"){
            order.cart.forEach(async(o)=>{
                await updateOrder(o._id,o.qty);
            }) 
        }
        order.status = req.body.status;
        if(req.body.status === "Delivery"){
            order.deliveryAt = Date.now();
            order.paymentInfo.status = "success";
            const serviceCharge =order.totalPrice *.10;
            await updateSellerInfo(order.totalPrice-serviceCharge);
            }
        await order.save({validateBeforeSave: false});
        response.send({
            success: true,
            order
        })
        const updateOrder = async (id,qty)=>{
            const product = await Product.findById(id);
            product.stock -=qty;
            product.sold_out +=qty;
        }
        const updateSellerInfo= async(amount)=>{
            const seller = await Shop.findById(req.seller.id);
            seller.availableBalance +=amount;
            await seller.save();
        }
    }
    catch(err){
        console.log(err);
        return next(new ErrorHandler(err.message,500))

    }
})

// refund 
router.put("/order-refund/:id",async(req, res, next)=>{
    try{
        const order = await Order.findById(req.params.id);
        if(!order){
            return next(new ErrorHandler(err.message,400))
        }
        order.status = req.body.status;
        await order.save({
            validateBeforeSave:false
        })
        res.send({
            success: true,
            message: "order refund request successfully"
        })
    }
    catch(err){
        console.log(err);
        return next(new ErrorHandler(err.message,500))
    }
})

router.put("/order-refund-success/:id",isSeller,async(req, res, next)=>{
    try{
        const order = await Order.findById(req.params.id);
        if(!order){
            return next(new ErrorHandler("order not found",400))
        }
        order.status = req.body.status;
        await Order.save();
        res.send({
            success: true,
            message: "order refund successfully"
        })
        if(req.body.status === "Refund Success"){
            order.cart.forEach(async(o)=>{
                await updateOrder(o._id,o.qty)
            })
        }
        const updateOrder = async(id, quantity)=>{
            const product = await Product.findById(id);
            product.stock += quantity;
            product.sold_out -= quantity;
        }
        await product.save({validateBeforeSave:false});

    }
    catch(err){
        console.log(err);
        return next(new ErrorHandler(err.message,500))

    }
})

router.get('/admin-all-orders', isAuthenticated,isAdmin("Admin"),async(req, res,next)=>{
    try{
        const order = await Order.find().sort({
            deliveryAt:-1,
            createdAt: -1
        })
        res.send({
            success: true,
            order
        })
    }
    catch(err){

    }
})

module.exports = router;