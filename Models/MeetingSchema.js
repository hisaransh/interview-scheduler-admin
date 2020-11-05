const mongoose = require('mongoose');

const Meeting = mongoose.Schema({
    title:String,
    description:String,
    meeting_date:Date,
    interviewer:[],
    interviewee:[],
    start_time:Date,
    end_time:Date
})



module.exports = mongoose.model('meeting',Meeting);