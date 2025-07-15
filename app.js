const express = require('express');
const mongoose = require('mongoose');
const user = require('./Models/User');
const Booking = require('./Models/Booking');
const Ride = require('./Models/Ride');
const path = require('path');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();
// const server =createServer(app)
// const io= new Server(server)


app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

// io.on("connection", (socket)=>{
//     console.log("a user connected");
//     socket.on("msg", (msg)=>{
//         console.log("msg received:",msg); 
//         io.emit("msg",msg);
//     });
// });


mongoose.connect('mongodb://localhost:27017/blabla')
.then(()=>{
    console.log("connected")
    app.listen(3000, () => console.log(`Server is running`))
})
.catch((err)=>{console.log("Server err")})


app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine','ejs');
app.use(express.json());

const authRoute= require('./routes/auth');
app.use('/',authRoute);

const rideRoutes= require('./routes/ride');
app.use('/',rideRoutes);

const userRoutes= require('./routes/personalized');
app.use('/',userRoutes);