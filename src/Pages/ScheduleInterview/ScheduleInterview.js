import './ScheduleInterview.css'
import {useState,useEffect} from 'react'
import MultiSelect from "react-multi-select-component";
import 'react-date-range/dist/styles.css'; // main style file for calendar component
import 'react-date-range/dist/theme/default.css'; // theme css file for calendar component
import { Calendar } from 'react-date-range';
import {addDays,isAfter,isBefore,format,setMinutes,setHours,setSeconds,addMinutes} from 'date-fns'
import { id } from 'date-fns/locale';
import{ Link } from "react-router-dom"
import { ToastContainer, toast } from 'react-toastify';


import MultiSelectInterviwer from './MultiSelectInterviwer'
import MultiSelectInterviwee from './MultiSelectInterviwee'

import ClashingPeople from './ClashingPeople'


const ScheduleInterview = () => {
    const [eventData,handleEventData] = useState({
        title:"",
        description:"",
        interviewer:[],
        interviewee:[],
    })
    const [selectedDate,handleSelectedDate] = useState(new Date())
    console.log("SELECTED DATA",selectedDate)
    const [eventDataTime,handleEventDataTime] = useState({
        "start":"",
        "end":""
    })
    const [errors,handleErrors] = useState({
        titleError:"",
        intervieweeError:"",
        interviewerError:"",
        timeError:""
    })
    const [isInterviewCreated,handleInterviewCreated] = useState(false);
    const [clashingArray,handleClashingArray] = useState([]);
    const notifySuccess = (text) => toast.success(text, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        });
    
    const notifyError = (text) => toast.error(text, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        });


    function handleSelect(e){
        handleSelectedDate(e)
    }
    function getHours(dateString){
        return parseInt(dateString.split(':')[0]);
    }
    function getMinutes(dateString){
        return parseInt(dateString.split(':')[1]);
    }
    function saveMeeting(){
        let flag = true;
        let titleErrorCheck = "";
        let intervieweeErrorCheck = "";
        let interviewerErrorCheck = "";
        let timeErrorCheck = "";
        console.log(eventData);
        console.log(eventDataTime)
        if(eventData.title === ""){
            titleErrorCheck="Title is required field";
            flag = false;
        }
        if(eventData.interviewee.length == 0){
            intervieweeErrorCheck="Choose at least 1 interviewee"
            flag = false;
        }
        if(eventData.interviewer.length == 0){
            interviewerErrorCheck="Choose at least 1 interviewer"
            flag = false;
        }
        let re = new RegExp("^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");
        if(eventDataTime.start === "" || eventDataTime.end === "" || re.test(eventDataTime.start)==false || re.test(eventDataTime.end)==false){
            timeErrorCheck="Time should be in 24 Hour format(HH:MM)."
            console.log(timeErrorCheck)
            flag = false;
        }
        if(flag === false){
            handleErrors({
                titleError:titleErrorCheck,
                intervieweeError:intervieweeErrorCheck,
                interviewerError:interviewerErrorCheck,
                timeError:timeErrorCheck
            })
            return;
        }
        //Converting Start Time and End time to Date() object;
        let tempStartDate = selectedDate;
        tempStartDate = setHours(tempStartDate,getHours(eventDataTime.start));
        tempStartDate = setMinutes(tempStartDate,getMinutes(eventDataTime.start));
        tempStartDate = setSeconds(tempStartDate,0);

        let tempEndDate = selectedDate;
        tempEndDate = setHours(tempEndDate,getHours(eventDataTime.end));
        tempEndDate = setMinutes(tempEndDate,getMinutes(eventDataTime.end));
        tempEndDate = setSeconds(tempEndDate,0);

        if(isBefore(tempEndDate,tempStartDate) || eventDataTime.start==eventDataTime.end){
            timeErrorCheck="Start time should be less the end time"
            flag = false;
        }
        
        if(flag === false){
            handleErrors({
                titleError:titleErrorCheck,
                intervieweeError:intervieweeErrorCheck,
                interviewerError:interviewerErrorCheck,
                timeError:timeErrorCheck
            })
            return;
        }else{
            handleErrors({
                titleError:"",
                intervieweeError:"",
                interviewerError:"",
                timeError:""
            })
        }
        
        let api_data = {
            title:eventData.title,
            description:eventData.description,
            interviewer:eventData.interviewer,
            interviewee:eventData.interviewee,
            selected_date:selectedDate,
            start_time:tempStartDate,
            end_time:tempEndDate
        }
        console.log("API DATA",api_data);
        fetch('http://localhost:8080/api/save-meeting',{
            "method":"POST",
            "body":JSON.stringify(api_data),
            "headers":{
                "Content-type":"application/json"
            }
        })
        .then((response)=>response.json())
        .then(response => {
            console.log("GOT RESPONSE",response)
            if(response.status === true && response.clash == false){
                handleEventData({
                    title:"",
                    description:"",
                    interviewer:[],
                    interviewee:[],
                })
                handleSelectedDate(new Date());
                handleEventDataTime({
                    "start":"",
                    "end":""
                })
                handleErrors({
                    titleError:"",
                    intervieweeError:"",
                    interviewerError:"",
                    timeError:""
                })
                handleClashingArray([])
                handleInterviewCreated(true)
                notifySuccess("Meeting Created 😇")
            }else if(response.status === true && response.clash === true){
                handleClashingArray(response.clashArray)
                notifyError("There is Clash in Timings ")
            }else{
                handleErrors({
                    titleError:response.titleError,
                    intervieweeError:response.intervieweeError,
                    interviewerError:response.interviewerError,
                    timeError:response.timeError
                })
                notifyError("There is Error in Input Data")
            }
        })
        
    
    }
    
    return (
        <div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover={false}
            />
            {isInterviewCreated ===false?(
                <div className="mb-5">
            
                    <div className="container-div1 d-flex flex-column">
                        <div style={{fontSize:'20px'}}>
                                Lets Schedule a interview
                        </div>
                        <div className="mt-2" style={{width:'322px'}}>
                            <div className="mt-4">
                                <div>
                                    Title *
                                </div>
                                <div className="mt-1" style={{height:'38px'}}>
                                    <input type="text" className="input-title" value={eventData.title} onChange={(e)=>handleEventData({...eventData,title:e.target.value})} />
                                </div>
                                <div className="mt-1" style={{color:'red'}}>
                                    {errors.titleError}
                                </div>
                            </div>
        
                            <div className="mt-3">
                                <div>
                                    Description
                                </div>
                                <div className="mt-1">
                                    <textarea className="input-description" value={eventData.description} onChange={(e)=>handleEventData({...eventData,description:e.target.value})}/>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div>
                                    Select Interviewer(s) *
                                </div>
                                <div className="mt-1">
                                    <MultiSelectInterviwer interviewer={eventData.interviewer} handleEventData={handleEventData}/>
                                </div>
                                <div className="mt-1" style={{color:'red'}}>
                                    {errors.interviewerError}
                                </div>
                            </div>
                            <div className="mt-3">
                                <div>
                                    Select Interviewee(s) *
                                </div>
                                <div className="mt-1">
                                    <MultiSelectInterviwee interviewee={eventData.interviewee} handleEventData={handleEventData}/>
                                </div>
                                <div className="mt-1" style={{color:'red'}}>
                                    {errors.intervieweeError}
                                </div>
                            </div>
                            <div className="mt-3">
                                <div>
                                    Choose Date *
                                </div>
                                <div>
                                <Calendar
                                    date={selectedDate}
                                    minDate={new Date()}
                                    onChange={handleSelect}
                                />
                                </div>
                            </div>
                            <div className="mt-3">
                                <div>
                                    Time in 24 Hour Format *
                                </div>
                                <div className="d-flex mt-2">
                                    <div>Start Time</div>
                                    <div>&nbsp;&nbsp;&nbsp;</div>
                                    <div>End Time</div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <input type="text" maxLength="5" className="timeinput" placeholder="HH:MM" value={eventDataTime.start} onChange={(e) => handleEventDataTime({...eventDataTime,start:e.target.value})} />
                                    <div>&nbsp;{"-"}&nbsp;</div>
                                    <input type="text" maxLength="5" className="timeinput" placeholder="HH:MM" value={eventDataTime.end} onChange={(e) => handleEventDataTime({...eventDataTime,end:e.target.value})} />
                                </div>
                                <div className="mt-1" style={{color:'red'}}>
                                    {errors.timeError}
                                </div>
                            </div>
                            <div className="mt-4">
                                <button className="btn btn-primary" onClick={saveMeeting}>Save</button>
                            </div>    
                        </div>
                        <div>
                                <ClashingPeople clashArray={clashingArray} selectedDate={selectedDate} />
                        </div>
                    </div>
                </div>
            ):(
                <div className="container">
                    <Link to="/">List all interview</Link>
                    <div onClick={(e) => handleInterviewCreated(false)}>
                        <a>Add Another Meeting</a>
                    </div>
                </div>
            )}
        </div>
        
    )
}


export default ScheduleInterview;