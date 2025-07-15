const express = require('express');
const router=express.Router();
const verifyToken= require('../Middleware/verifyToken');
const Ride= require('../Models/Ride');
const User =require('../Models/User');
const Booking =require('../Models/Booking');

router.get('/booked-rides',verifyToken,async (req,res)=>{
     try{
    const allBookedRides =await Booking.find({userId:req.userId}).populate('rideId'); 
    const now =new Date();
    const today=new Date(now.toISOString().slice(0,10)); 
  console.log("Is Logged In:",req.isLoggedIn);
    console.log("Username:",req.username);
    const upcomingRides=[];
    const pastRides=[];
    const selfFiltered = allBookedRides.filter(b=>b.bookingFor=== "myself");

    selfFiltered.forEach(booking => {
      const rideDate =new Date(booking.rideId.date); 
      if(rideDate>=today){ upcomingRides.push(booking); } 
      else{ pastRides.push(booking);  }
    }); 
     res.render("booked",{ upcomingRides,pastRides,isLoggedIn: req.isLoggedIn,username:req.username,userId:req.userId});
    
    }catch(err){  console.log(err);  }
});

router.get('/profile',verifyToken,async (req,res)=>{
  try{
    const user= await User.findById(req.userId);
   res.render('profile',{user,isLoggedIn:req.isLoggedIn, username: req.username ,userId:req.userId});
   // res.send("user profile")
  }catch(err){
    console.error(err);
  }
});

router.post("/rating",verifyToken, async (req,res)=>{
  try {
    const {rating,bookingId}= req.body;
    const booking= await Booking.findById(bookingId);
      booking.rating=rating;
      await booking.save();
      res.json({ message:"Rating updated", rating });
  } catch (err){
    console.error(err);
  }
});


router.get("/inbox",verifyToken, async (req,res)=>{
 // const user= await User.findById(userId)
   res.render("chats",{isLoggedIn: true,username:req.username} )
})

module.exports=router;