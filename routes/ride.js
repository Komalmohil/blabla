const express = require('express');
const router = express.Router();
const Ride = require('../Models/Ride');
const verifyToken= require('../Middleware/verifyToken');
const auth = require('../Middleware/authRoute');
const Booking = require('../Models/Booking');

router.get('/publish',auth,(req, res)=>{
  res.render('ride',{ isLoggedIn: req.isLoggedIn, username:req.username}); 
});
//     if(typeof returnTrip !=='undefined') { returnTrip=false; }else{  returnTrip=true; }
//    if(typeof returnTripDone !=='undefined') { returnTripDone =fasle;}else{ returnTripDone =true; }
//  if(typeof later !=='undefined') {  later =false;  } else {  later =true; }

router.post('/create-ride',verifyToken, async(req,res) =>{
  console.log("User ID:",req.userId); 
  const {location,destination, date,pickupPoint, dropoffPoint, pickupTime,seats, price, returnTrip,returnTripDone,later }= req.body;
   
   console.log("returnTrip:",returnTrip);
   console.log("returnTripDone:",returnTripDone);
  console.log("Later:",later)
  try {
    const newRide = new Ride({
    publisher: req.userId,  location,destination, date,pickupPoint, dropoffPoint, pickupTime,seats, price,
    returnTrip: returnTrip||false,
    returnTripDone: returnTripDone|| false,
    later: later|| false
  });
    await newRide.save();
    res.status(200).send('Ride published successfully!');
  } catch(err){
    console.error(err);
    res.send('error');
  }
});


router.get('/ride/:locDest',auth,async (req, res) => {
  try {
    const [location, destination]=req.params.locDest.split('-');
    const ride= await Ride.findOne({ location, destination });
    if (!ride) return res.status(404).send('Ride not found');
   
    res.render('details',{ride, isLoggedIn: req.isLoggedIn,username:req.username});
  } catch(err){
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/book-ride', verifyToken, async (req, res) => {
  const {  rideId,passengerName,passengersNo,phoneNumber,otherPassengerName,passengerEmail,phoneNo,no,bookingFor } = req.body;

  try {
    const ride= await Ride.findById(rideId);
    const seatCount=bookingFor=== 'myself'?passengersNo:no;

    if (ride.seats <= 0) return res.send("The seats are already taken");
    if (seatCount> ride.seats){  return res.send(`<script> alert("Only ${ride.seats} seats are available"); </script>`); }

     const booking = new Booking({
      rideId, bookingFor,
      username:req.username,
      userId: req.userId,
      count: seatCount,
      name: bookingFor=== 'myself' ?passengerName :otherPassengerName,
      phoneNo:bookingFor === 'myself'? phoneNumber:phoneNo,
      email: bookingFor === 'other'?passengerEmail: undefined
    });

    await booking.save();

    ride.bookings.push(booking._id);
    ride.seats -=seatCount;
    await ride.save();

    res.send(`<script> alert("Ride booked successfully for ${booking.name}. ${ride.seats} seats left!");</script>`);
  } catch(err){
    console.error(err);
  }
});

router.get('/get-rides',verifyToken,async (req,res) =>{
 const min =new Date().toISOString().slice(0,10);
  const allRides= await Ride.find();
  const FilteredRides =allRides.filter(ride =>ride.date>=min);
  res.render('allrides',{rides: FilteredRides,isLoggedIn: req.isLoggedIn, username:req.username});
});

router.get('/search',auth,async (req,res) => {  
 try { const min =new Date().toISOString().slice(0,10);
    const allRides=await Ride.find(); 
    const FilteredRides =allRides.filter(ride =>ride.date>=min);
    res.render('search',{rides:FilteredRides, isLoggedIn: req.isLoggedIn, username:req.username}); 
  }catch(err){
    console.error(err);
  }
});

router.get('/published-rides', verifyToken, async (req, res)=>{
  try {
    const userId= req.userId; 
    const rides =await Ride.find({publisher:userId});
    res.render('publishedRides', { rides, isLoggedIn:req.isLoggedIn, username: req.username });
  } catch (err) {console.error(err);}
});




module.exports=router;
