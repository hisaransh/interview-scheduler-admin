const express = require('express');

const router = express.Router()

const User = require('../Models/UserSchema');
const Meeting = require('../Models/MeetingSchema');
const ObjectId = require("mongodb").ObjectID
const { addDays ,isAfter,isBefore } = require('date-fns');

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
    
    let user_data;
    User.find({},function(err,ret_data){
        if(err){
            console.log(err)
        }
        user_data = ret_data;
    })
    let intervieweeArray = req.body.interviewee;
    intervieweeArray = intervieweeArray.concat(req.body.interviewer)
    for(let i=0;i<intervieweeArray.length;i++){
        let intervieweeId = intervieweeArray[i].value;
        User.findById(intervieweeId,function(err,ret_data){
            if(err)console.log(err);
            if((ret_data.booked === null || ret_data.booked.length === 0) === false){
                for(let j=0;j<ret_data.booked.length;j++){
                    let eventStartTime = new Date(req.body.start_time);
                    let eventEndTime = new Date(req.body.end_time);
                    let bookedStartTime = new Date(ret_data.booked[j].start);
                    let bookedEndTime = new Date(ret_data.booked[j].end);
                    if(isAfter(bookedStartTime,eventStartTime) === true && isBefore(bookedEndTime,eventEndTime) === true){
                        console.log("CLASHING FOR ",ret_data.name);
                    }
                }
            }
        })
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
    const saveMeeting = await newMeeting.save();
    // console.log(saveMeeting)
    // console.log(typeof saveMeeting)
    // console.log(typeof saveMeeting._id)
    // console.log(typeof saveMeeting._id.toString())
    // console.log(saveMeeting._id.toString())
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

module.exports = router;