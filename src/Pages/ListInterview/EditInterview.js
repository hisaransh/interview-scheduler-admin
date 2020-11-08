import { useEffect ,useState} from "react";
import 'react-date-range/dist/styles.css'; // main style file for calendar component
import 'react-date-range/dist/theme/default.css'; // theme css file for calendar component
import { Calendar } from 'react-date-range';
import MultiSelect from "react-multi-select-component";
import {addDays,isAfter,isBefore,format,setMinutes,setHours,setSeconds,addMinutes} from 'date-fns'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams,
    Redirect,
    useLocation,
  } from "react-router-dom";
  import { ToastContainer, toast } from 'react-toastify';

import ClashingPeople from '../ScheduleInterview/ClashingPeople'

  const MultiSelectInterviwer = ({interviewer,handleEventData}) => {
    const [options,handleOptions] = useState([]);
    const [optionSelected, handleOptionSelected] = useState(interviewer);
    const [loading,handleLoading] = useState(true);
    console.log("OPTION SELECTED",optionSelected)
    function changeSelectedOptionHelper(e){
        handleEventData(e)
    }
    useEffect(()=>{
        fetch('http://localhost:8080/api/get-interviewer')
        .then(response => response.json())
        .then((response) => {
            if(response.status === true){
                console.log(response)
                let tempOptionsArray = [];
                let tempOptionsSelectedArray = [];
                for(let i=0;i<response.data.length;i++){
                    tempOptionsArray.push({
                        label:response.data[i].name,
                        value:response.data[i]._id
                    })
                }
                handleOptions(tempOptionsArray)
            }
            handleLoading(false)
        }, function(error) {
            console.log("Error in username api call",error.message)
        });
    },[])

    useEffect(()=>{
        handleOptionSelected(interviewer)
    },[interviewer])

    return (
    <div>
        <MultiSelect
        options={options}
        value={optionSelected}
        onChange={changeSelectedOptionHelper}
        labelledBy={"Select"}
        isLoading={loading}
        />
    </div>
    );
}

const MultiSelectInterviwee = ({interviewee,handleEventData}) => {
    const [options,handleOptions] = useState([]);
    const [optionSelected, handleOptionSelected] = useState(interviewee);
    const [loading,handleLoading] = useState(true);

    function changeSelectedOptionHelper(e){
        handleEventData(e)
    }
    useEffect(()=>{
        fetch('http://localhost:8080/api/get-interviewee')
        .then(response => response.json())
        .then((response) => {
            if(response.status === true){
                console.log(response)
                let tempOptionsArray = [];
                for(let i=0;i<response.data.length;i++){
                    tempOptionsArray.push({
                        label:response.data[i].name,
                        value:response.data[i]._id
                    })
                }
                handleOptions(tempOptionsArray)
            }
            handleLoading(false)
        }, function(error) {
            console.log("Error in username api call",error.message)
        });
        
    },[])

    useEffect(()=>{
        handleOptionSelected(interviewee)
    },[interviewee])

    return (
    <div>
        <MultiSelect
        options={options}
        value={optionSelected}
        onChange={changeSelectedOptionHelper}
        labelledBy={"Select"}
        isLoading={loading}
        />
    </div>
    );
}


export default function EditInterview(){
    let MeetingData = useLocation().state
    console.log(MeetingData)
    const [eventData,handleEventData] = useState({
        title:"",
        description:"",
    })
    const [interviewer,handleInterviewer] = useState([]);
    const [interviewee,handleInterviewee] = useState([]);
    const [selectedDate,handleSelectedDate] = useState(new Date())
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
    const [clashingArray,handleClashingArray] = useState([]);
    const [updated,handleUpdated] = useState(false);
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
        
    useEffect(()=>{
        handleEventData({
            title:MeetingData.data.title,
            description:MeetingData.data.description,
        })
        handleSelectedDate(new Date(MeetingData.data.meeting_date));
        let event_start_time = new Date(MeetingData.data.start_time);
        let event_end_time = new Date(MeetingData.data.end_time);
        let start_time_string = "";
        if(event_start_time.getHours()<=9){
            start_time_string = "0" + event_start_time.getHours().toString();
        }else{
            start_time_string = event_start_time.getHours().toString();
        }
        start_time_string += ":"
        if(event_start_time.getMinutes()<=9){
            start_time_string += "0" + event_start_time.getMinutes().toString();
        }else{
            start_time_string += event_start_time.getMinutes().toString();
        }
        let end_time_string = "";
        if(event_end_time.getHours()<=9){
            end_time_string = "0" + event_end_time.getHours().toString();
        }else{
            end_time_string = event_end_time.getHours().toString();
        }
        end_time_string += ":"
        if(event_end_time.getMinutes()<=9){
            end_time_string += "0" + event_end_time.getMinutes().toString();
        }else{
            end_time_string += event_end_time.getMinutes().toString();
        }
        console.log(start_time_string)
        console.log(end_time_string)
        handleEventDataTime({
            "start":start_time_string,
            "end":end_time_string
        })
    },[])
    useEffect(()=>{
        fetch('http://localhost:8080/api/get-interviewer')
        .then(response => response.json())
        .then((response) => {
            if(response.status === true){
                let tempOptionsSelectedArray = [];
                for(let i=0;i<response.data.length;i++){
                    if((MeetingData.data.interviewer).includes(response.data[i]._id)){
                        tempOptionsSelectedArray.push({
                            label:response.data[i].name,
                            value:response.data[i]._id
                        })
                    }
                }
                console.log("INTERVIEWER",tempOptionsSelectedArray)
                handleInterviewer(tempOptionsSelectedArray);

            }
        })
    },[])
    useEffect(()=>{
        fetch('http://localhost:8080/api/get-interviewee')
        .then(response => response.json())
        .then((response) => {
            if(response.status === true){
                let tempOptionsSelectedArray = [];
                for(let i=0;i<response.data.length;i++){
                    if((MeetingData.data.interviewee).includes(response.data[i]._id)){
                        tempOptionsSelectedArray.push({
                            label:response.data[i].name,
                            value:response.data[i]._id
                        })
                    }
                }
                handleInterviewee(tempOptionsSelectedArray)
            }
        })
    },[])
    function handleSelect(e){
        handleSelectedDate(e)
    }
    function getHours(dateString){
        return parseInt(dateString.split(':')[0]);
    }
    function getMinutes(dateString){
        return parseInt(dateString.split(':')[1]);
    }
    function updateMeeting(){
        let flag = true;
        let titleErrorCheck = "";
        let intervieweeErrorCheck = "";
        let interviewerErrorCheck = "";
        let timeErrorCheck = "";
        
        if(eventData.title === ""){
            titleErrorCheck="Title is required field";
            flag = false;
        }
        if(interviewee.length == 0){
            intervieweeErrorCheck="Choose at least 1 interviewee"
            flag = false;
        }
        if(interviewer.length == 0){
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

        if(isBefore(tempEndDate,tempStartDate)){
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
        }

        let api_data = {
            title:eventData.title,
            description:eventData.description,
            interviewer:interviewer,
            interviewee:interviewee,
            selected_date:selectedDate,
            start_time:tempStartDate,
            end_time:tempEndDate,
            meeting_id:MeetingData.data._id
        }
        console.log("API DATA",api_data);
        fetch('http://localhost:8080/api/update-meeting',{
            "method":"POST",
            "body":JSON.stringify(api_data),
            "headers":{
                "Content-type":"application/json"
            }
        })
        .then((response)=>response.json())
        .then(response => {
            console.log("RESPONSE  ",response)
            if(response.status === true && response.clash === false){
                notifySuccess("Meeting Updated 😇")
                handleUpdated(true)
            }else if(response.status === true && response.clash === true){
                notifyError("There is Clash in Timings ")
                handleClashingArray(response.clashArray)
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
    function ShowClashingPeople(){
        if(clashingArray.length === 0){
            return <></>
        }else{
            return <div>
                Following people also have event at same time.Please reschedule it.
                {clashingArray.map((val,index)=> (
                    <div key={index}>
                        {val}
                    </div>
                ))}
            </div>
        }
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
            {updated===false?(
                <div className="mb-5">
                    <div className="container-div1 d-flex flex-column">
                        <div style={{fontSize:'20px'}}>
                                Edit the following Interview
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
                                    <MultiSelectInterviwer interviewer={interviewer} handleEventData={handleInterviewer}/>
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
                                    <MultiSelectInterviwee interviewee={interviewee} handleEventData={handleInterviewee}/>
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
                                <button className="btn btn-primary" onClick={updateMeeting} >Update</button>
                            </div>
                        </div>
                        <ClashingPeople clashArray={clashingArray} selectedDate={selectedDate}/>
                    </div>
                </div>
            ):(
                <div className="containter">
                    Meeting updated
                    <br/>
                    <Link to="/">Go to Home</Link>
                </div>
            )}
        </div>
        
    )
}