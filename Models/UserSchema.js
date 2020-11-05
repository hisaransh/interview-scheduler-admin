const mongoose = require('mongoose');

const bookedSchema = mongoose.Schema({
  start:Date,
  end:Date,
  meeting_id:String,
})

const User = mongoose.Schema({
  name:String,
  email_id:String,
  type:Number,
  booked:Array
})



module.exports = mongoose.model('user',User);