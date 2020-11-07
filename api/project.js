const express = require('express');

const router = express.Router()

const User = require('../Models/UserSchema');
const Meeting = require('../Models/MeetingSchema');
const ObjectId = require("mongodb").ObjectID
const { addDays ,isAfter,isBefore,setHours,setMinutes,setSeconds,areIntervalsOverlapping } = require('date-fns');
var nodemailer = require('nodemailer');
const ics = require('ics')

var transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
       ciphers:'SSLv3'
    },
    auth: {
        user: process.env.email,
        pass: process.env.email_password
    }
});

function sendMail(attendeeArray,event_date,event_title,event_description,event_starttime,event_endtime){
    console.log("SEND MAIL CALLED");
    // setup e-mail data, even with unicode symbols
    let attendeesArray = [];
    for(let i=0;i<attendeeArray.length;i++){
        attendeesArray.push({
            name:attendeeArray[i].name,
            email:attendeeArray[i].email_id,
            rsvp:true
        })
    }
    // console.log(attendeesArray)

    let event_start_time = new Date(event_starttime);
    let event_end_time = new Date(event_endtime);
    const event = {
        start: [event_start_time.getFullYear(),event_start_time.getMonth(),event_start_time.getDate(),event_start_time.getHours(),event_start_time.getMinutes()],
        end : [event_end_time.getFullYear(),event_end_time.getMonth(),event_end_time.getDate(),event_end_time.getHours(),event_end_time.getMinutes()],
        title: event_title,
        description: event_description,
        location: 'Google Meet',
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'ADMIN - Saransh Hinger', email: 'saranshhinger@outlook.com' },
        attendees: attendeesArray
      }
      ics.createEvent(event, (error, value) => {
        if (error) {
          console.log(">>>:",error)
          return
        }
        let csvTo = "";
        for(let i=0;i<attendeeArray.length;i++){
            csvTo += attendeeArray[i].email_id;
            if(i+1<attendeeArray.length){
                csvTo += ','
            }
        }
        console.log(value)
        console.log(csvTo)
        var mailOptions = {
            from: '"SARANSH HINGER - ADMIN" <saranshhinger@outlook.com>', // sender address (who sends)
            to: csvTo, // list of receivers (who receives)
            subject: event_title, // Subject line
            text: event_description, // plaintext body
            icalEvent: {
                filename: 'invitation.ics',
                method: 'request',
                content: value.toString()
            }
        };
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(">>>:>>>",error);
            }
    
            console.log('Message sent: ' + info.response);
        });
    })
    

    
    
}
// sendMail();

router.get('/' , async (req,res) => {
    res.json({
        "message":"success"
    })
});

router.get('/get-interviewee',async(req,res)=>{
    console.log("/get-interviewee API CALLED")
    User.find({},function(err,ret_data){
        if(err){
            console.log(err)
        }
        // let meetingData =  userData.meetings.filter((ele) => {return ele._id.toString() === objectId_meeting_id.toString()});
        let intervieweeData = ret_data.filter((data)=> {return data.type===2})

        intervieweeData = intervieweeData.map(({_id, name}) => {
            return {_id, name};
        })
        console.log("API FUNC INTERVIEWEE DATA",intervieweeData)
        res.json({
            status:true,
            data:intervieweeData
        })
    })
})

router.get('/get-interviewer',async(req,res)=>{
    console.log("/get-interviewer API CALLED")
    User.find({},function(err,ret_data){
        if(err){
            console.log(err)
        }
        // let meetingData =  userData.meetings.filter((ele) => {return ele._id.toString() === objectId_meeting_id.toString()});
        let intervieweeData = ret_data.filter((data)=> {return data.type===1})

        intervieweeData = intervieweeData.map(({_id, name}) => {
            return {_id, name};
        })
        console.log("API FUNC INTERVIEWR DATA",intervieweeData)
        res.json({
            status:true,
            data:intervieweeData
        })
    })
})

router.post('/save-meeting',async(req,res) =>{
    console.log("/save-meeting API CALLED",req.body);
    let status = true;
    let titleErrorCheck = "";
    let intervieweeErrorCheck = "";
    let interviewerErrorCheck = "";
    let timeErrorCheck="";
    if(req.body.title=== null || req.body.title === ""){
        titleErrorCheck="Title is required field";
        status = false;
    }
    if(req.body.interviewee=== null || req.body.interviewee.length === 0){
        intervieweeErrorCheck="Choose at least 1 interviewee"
        status = false;
    }
    if(req.body.interviewer=== null || req.body.interviewer.length === 0){
        interviewerErrorCheck="Choose at least 1 interviewer"
        status = false;
    }
    let re = new RegExp("^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");
    
    let tempStartDate = new Date(req.body.selectedDate);
    let tempEndDate = new Date(req.body.selectedDate);
    

    if(isBefore(tempEndDate,tempStartDate)){
        timeErrorCheck="Start time should be less the end time"
        status = false;
    }
    if(status === false){
        res.json({
            "status" : false,
            "titleError":titleErrorCheck,
            "intervieweeError":intervieweeErrorCheck,
            "interviewerError":interviewerErrorCheck,
            "timeError":timeErrorCheck
        })
        return;
    }
    
    User.find({},function(err,ret_data){
        if(err){
            console.log(err)
        }
        user_data = ret_data;
    })
    
    let intervieweeArray = req.body.interviewee;
    intervieweeArray = intervieweeArray.concat(req.body.interviewer)
    
    var clashArray = [];
    
    let personIdArray = intervieweeArray.map( ({value}) => {return ObjectId(value)});
    
    
    let ret_data = await User.find({'_id':{
        $in:personIdArray
    }})
    let eventStartTime = new Date(req.body.start_time);
    let eventEndTime = new Date(req.body.end_time);
    for(let i=0;i<ret_data.length;i++){
        for(let j=0;j<ret_data[i].booked.length;j++){
            let bookedStartTime = new Date(ret_data[i].booked[j].start);
            let bookedEndTime = new Date(ret_data[i].booked[j].end);
            if(isBefore(bookedStartTime,eventEndTime) === true && isBefore(eventStartTime,bookedEndTime) === true){
                console.log("------------------CLASHED----------------------------------",ret_data[i].name)
                clashArray.push({"name":ret_data[i].name,"_id":ret_data[i]._id});
                break;
            }
        }
    }
    console.log(clashArray)
    if(clashArray.length>0){
        res.json({
            status:true,
            clash:true,
            clashArray:clashArray
        })
        
        return;
    }
    

    intervieweeId = req.body.interviewee.map( ({value}) => {return value})
    interviewerId = req.body.interviewer.map( ({value}) => {return value})
    let newMeeting = new Meeting({
        title:req.body.title,
        description:req.body.description,
        meeting_date:req.body.selected_date,
        interviewer:interviewerId,
        interviewee:intervieweeId,
        start_time:req.body.start_time,
        end_time:req.body.end_time
    })
    console.log("SAVING THE MEETING",newMeeting)
    const saveMeeting = await newMeeting.save();
    
    let Meeting_id = saveMeeting._id.toString()
    intervieweeArrayId = intervieweeArray.map( ({value}) => {return value})
    const update_res = await User.updateMany({
            _id:{
                $in:intervieweeArrayId
                }
            },
            {$push:{booked:{
        start:req.body.start_time,
        end:req.body.end_time,
        meeting_id:saveMeeting._id
    }}})

    res.json({
        "status":true,
        "clash":false,
        "new_meeting":saveMeeting
    })

    // sendMail(ret_data,req.body.selected_date,req.body.title,req.body.description,req.body.start_time,req.body.end_time);

})

router.post('/get-meetings',async(req,res)=>{
    console.log("/get-meetings api called",req.body);

    meetingData = await Meeting.find({});
    console.log(meetingData)
    res.json({
        status:true,
        data:meetingData
    })
})

router.post('/update-meeting',async(req,res)=>{
    console.log("/update-meetings api called",req.body);

    let status = true;
    let titleErrorCheck = "";
    let intervieweeErrorCheck = "";
    let interviewerErrorCheck = "";
    let timeErrorCheck="";
    if(req.body.title=== null || req.body.title === ""){
        titleErrorCheck="Title is required field";
        status = false;
    }
    if(req.body.interviewee=== null || req.body.interviewee.length === 0){
        intervieweeErrorCheck="Choose at least 1 interviewee"
        status = false;
    }
    if(req.body.interviewer=== null || req.body.interviewer.length === 0){
        interviewerErrorCheck="Choose at least 1 interviewer"
        status = false;
    }
    let re = new RegExp("^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");
    
    let tempStartDate = new Date(req.body.selectedDate);
    let tempEndDate = new Date(req.body.selectedDate);
    

    if(isBefore(tempEndDate,tempStartDate)){
        timeErrorCheck="Start time should be less the end time"
        status = false;
    }
    if(status === false){
        res.json({
            "status" : false,
            "titleError":titleErrorCheck,
            "intervieweeError":intervieweeErrorCheck,
            "interviewerError":interviewerErrorCheck,
            "timeError":timeErrorCheck
        })
        return;
    }
    
    
    let intervieweeArray = req.body.interviewee;
    intervieweeArray = intervieweeArray.concat(req.body.interviewer)
    
    var clashArray = [];
    
    let personIdArray = intervieweeArray.map( ({value}) => {return ObjectId(value)});
    
    
    let ret_data = await User.find({'_id':{
        $in:personIdArray
    }})

    let eventStartTime = new Date(req.body.start_time);
    let eventEndTime = new Date(req.body.end_time);
    for(let i=0;i<ret_data.length;i++){
        for(let j=0;j<ret_data[i].booked.length;j++){
            if(ret_data[i].booked[j].meeting_id.toString() != req.body.meeting_id)
            {
                let bookedStartTime = new Date(ret_data[i].booked[j].start);
                let bookedEndTime = new Date(ret_data[i].booked[j].end);
                if(isBefore(bookedStartTime,eventEndTime) === true && isBefore(eventStartTime,bookedEndTime) === true){
                    console.log("------------------CLASHED----------------------------------",ret_data[i].name)
                    clashArray.push(ret_data[i].name);
                    break;
                }
            }
        }
    }
    console.log(clashArray)
    if(clashArray.length>0){
        console.log("IN")
        res.json({
            status:true,
            clash:true,
            clashArray:clashArray
        })
        console.log("RETURNED")
        return;
    }

    let saved_meeting = await Meeting.findById(req.body.meeting_id);
    intervieweeId = req.body.interviewee.map( ({value}) => {return value})
    interviewerId = req.body.interviewer.map( ({value}) => {return value})
    const meeting_update = await Meeting.updateOne({_id:ObjectId(req.body.meeting_id)},{
        title:req.body.title,
        description:req.body.description,
        meeting_date:req.body.selected_date,
        interviewer:interviewerId,
        interviewee:intervieweeId,
        start_time:req.body.start_time,
        end_time:req.body.end_time
    })

    intervieweeArrayId = intervieweeArray.map( ({value}) => {return value})
    const update_res = await User.updateMany({
            _id:{
                $in:intervieweeArrayId
                }
            },
            {$push:{booked:{
        start:req.body.start_time,
        end:req.body.end_time,
        meeting_id:req.body.meeting_id
    }}})

    res.json({
        "status":true,
        "clash":false,
    })
    
})

router.post('/get-person-occupied-time',async(req,res)=>{
    console.log("/get-person-occupied-time",req.body);
    if(req.body.selectedDate === null || req.body.person_id == null){
        res.json({
            "status":false
        })
        return;
    }
    let DayStartingTime = new Date(req.body.selectedDate);
    DayStartingTime = setHours(DayStartingTime,0);
    DayStartingTime = setMinutes(DayStartingTime,0);
    DayStartingTime = setSeconds(DayStartingTime,0);
    let DayEndingTime = new Date(req.body.selectedDate);
    DayEndingTime = setHours(DayEndingTime,23);
    DayEndingTime = setMinutes(DayEndingTime,59);
    DayEndingTime = setSeconds(DayEndingTime,59);
    
    console.log(DayStartingTime.toString(),DayEndingTime.toString());
    let OccupiedInterval = [];
    user_data = await User.findById(req.body.person_id);
    
    for(let i=0;i<user_data.booked.length;i++){
        let bookedData = user_data.booked[i];

        if(areIntervalsOverlapping(
            { start: DayStartingTime, end: DayEndingTime },
            { start: new Date(bookedData.start), end: new Date(bookedData.end) }
          ) === true){
            OccupiedInterval.push({
                start:new Date(bookedData.start),
                end : new Date(bookedData.end)
            })
          }
    }
    
    res.json({
        "status":true,
        OccupiedInterval:OccupiedInterval
    })

})
module.exports = router;