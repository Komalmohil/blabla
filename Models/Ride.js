const mongoose = require('mongoose');
const { Schema } = mongoose;

const User = require('./User');
const Booking = require('./Booking');

const rideSchema=new mongoose.Schema({
  publisher: { type: Schema.Types.ObjectId, ref: 'User' },
  location: String,
  destination: String,
  date : String,
  pickupPoint: String,
  dropoffPoint: String,
  pickupTime: String,
  seats : Number,
  price: Number,
  returnTrip: {type: Boolean,default:false },
  returnTripDone: { type: Boolean, default:false },
  createdAt:{ type:Date, default:Date.now },
  bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }]
});

module.exports=mongoose.model('Ride',rideSchema);
