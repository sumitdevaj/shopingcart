const app = require("./app");
const connectDB = require("./db/Database");


connectDB()
app.listen(process.env.PORT,()=>{
    console.log('server listening on port',process.env.PORT);
    
})