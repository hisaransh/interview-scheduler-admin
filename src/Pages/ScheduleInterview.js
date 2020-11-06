import './ScheduleInterview.css'
import {useState,useEffect} from 'react'
import MultiSelect from "react-multi-select-component";
import 'react-date-range/dist/styles.css'; // main style file for calendar component
import 'react-date-range/dist/theme/default.css'; // theme css file for calendar component
import { Calendar } from 'react-date-range';
import {addDays,isAfter,isBefore,format,setMinutes,setHours,setSeconds,addMinutes} from 'date-fns'

const MultiSelectInterviwer = ({interviewer,handleEventData}) => {
    const [options,handleOptions] = useState([]);
    const [optionSelected, handleOptionSelected] = useState(interviewer);
    const [loading,handleLoading] = useState(true);

    function changeSelectedOptionHelper(e){
        handleEventData((prevState) => ({
            ...prevState,
            interviewer:e
        }))
    }
    useEffect(()=>{
        fetch('http://localhost:8080/api/get-interviewer')
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
        handleEventData((prevState) => ({
            ...prevState,
            interviewee:e
        }))
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

const ScheduleInterview = () => {
    const [eventData,handleEventData] = useState({
        title:"",
        description:"",
        interviewer:[],
        interviewee:[],
    })
    const [selectedDate,handleSelectedDate] = useState(new Date())
    console.log("SELECTED DATA",selectedDate)
    const [eventDataTime,handleEventDateTime] = useState({
        "start":"",
        "end":""
    })
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
        let re = new RegExp("^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");
        if(eventData.interviewee.length >= 1 && eventData.interviewer.length >= 1 && re.test(eventDataTime.start)==true && re.test(eventDataTime.end)==true){
            //Converting Start Time and End time to Date() object;
            let tempStartDate = selectedDate;
            tempStartDate = setHours(tempStartDate,getHours(eventDataTime.start));
            tempStartDate = setMinutes(tempStartDate,getMinutes(eventDataTime.start));
            tempStartDate = setSeconds(tempStartDate,0);

            let tempEndDate = selectedDate;
            tempEndDate = setHours(tempEndDate,getHours(eventDataTime.end));
            tempEndDate = setMinutes(tempEndDate,getMinutes(eventDataTime.end));
            tempEndDate = setSeconds(tempEndDate,0);

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
                console.log("API RESPONSE",response)
            })
            
        }
    }
    return (
        <div className="mb-5">
            
            <div className="container-div1 d-flex flex-column">
                <div>
                        Lets Schedule a interview
                </div>
                <div className="mt-2">
                    <div className="mt-2">
                        <div>
                            Title *
                        </div>
                        <div className="mt-1">
                            <input type="text" value={eventData.title} onChange={(e)=>handleEventData({...eventData,title:e.target.value})} />
                        </div>
                    </div>

                    <div className="mt-2">
                        <div>
                            Description
                        </div>
                        <div>
                            <input type="textarea" value={eventData.description} onChange={(e)=>handleEventData({...eventData,description:e.target.value})}/>
                        </div>
                    </div>
                    <div className="mt-2">
                        <div>
                            Select Interviewer(s) *
                        </div>
                        <div>
                            <MultiSelectInterviwer interviewer={eventData.interviewer} handleEventData={handleEventData}/>
                        </div>
                    </div>
                    <div className="mt-2">
                        <div>
                            Select Interviewee(s) *
                        </div>
                        <div>
                            <MultiSelectInterviwee interviewee={eventData.interviewee} handleEventData={handleEventData}/>
                        </div>
                    </div>
                    <div className="mt-2">
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
                    <div className="mt-2">
                        <div>
                            Time in 24 Hour Format *
                        </div>
                        <div>
                            <input type="text" placeholder="HH:MM" value={eventDataTime.start} onChange={(e) => handleEventDateTime({...eventDataTime,start:e.target.value})} />
                            <input type="text" placeholder="HH:MM" value={eventDataTime.end} onChange={(e) => handleEventDateTime({...eventDataTime,end:e.target.value})} />
                        </div>
                    </div>
                    <div className="mt-2">
                        <button className="btn btn-primary" onClick={saveMeeting}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default ScheduleInterview;