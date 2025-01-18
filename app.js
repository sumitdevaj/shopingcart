const express = require('express');
const app = express();
const ErrorHandler = require('./middleware/error');
const cookiesParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(cookiesParser());
app.use('/test',(req,res)=>{
    res.send("hello world!");
})

app.use(bodyParser.urlencoded({extended: true}))
if(process.env.NODE_ENV !== 'production'){
    require("dotenv").config({
        path:"config/.env"
    })
}

const user= require("./controller/user.controller");
const shop = require("./controller/shop.controller");

app.use("/api/v1/user",user);
app.use("/api/v1/shop",shop);







app.use(ErrorHandler)
module.exports =app;
