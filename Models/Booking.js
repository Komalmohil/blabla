 const mongoose = require('mongoose');
 const { Schema } = mongoose;
const User =require('./User');
const Ride = require('./Ride');

 const bookingSchema=new mongoose.Schema(
    {
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride'},      
    userId:   { type: Schema.Types.ObjectId, ref: 'User'},
    username: String,
    bookingFor: {type: String, enum:["myself","other"],required: true  },
    name: String,          
    email: String,         
    count: Number,         
    phoneNo: Number,  
    rating:{type: Number, default:null}  
    });

module.exports=mongoose.model('Booking',bookingSchema);