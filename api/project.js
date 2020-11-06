const express = require('express');

const router = express.Router()

const User = require('../Models/UserSchema');
const Meeting = require('../Models/MeetingSchema');
const ObjectId = require("mongodb").ObjectID
const { addDays ,isAfter,isBefore,setHours,setMinutes,setSeconds } = require('date-fns');

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
                clashArray.push(ret_data[i].name);
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
        res.json({
            status:true,
            clash:true,
            clashArray:clashArray
        })
        
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

module.exports = router;