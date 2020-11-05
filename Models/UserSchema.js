const mongoose = require('mongoose');

const User = mongoose.Schema({
  name:String,
  email_id:String,
  type:Number,
  booked:Array
})



module.exports = mongoose.model('user',User);