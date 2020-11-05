const express = require('express');

const router = express.Router()

const User = require('../Models/UserSchema');

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

module.exports = router;