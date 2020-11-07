import './ScheduleInterview.css'
import {useState,useEffect} from 'react'
import MultiSelect from "react-multi-select-component";
import 'react-date-range/dist/styles.css'; // main style file for calendar component
import 'react-date-range/dist/theme/default.css'; // theme css file for calendar component
import { Calendar } from 'react-date-range';
import {addDays,isAfter,isBefore,format,setMinutes,setHours,setSeconds,addMinutes} from 'date-fns'
import { id } from 'date-fns/locale';
import{
    Link
    } from "react-router-dom"
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

const ClashingTime = ({selectedDate,selectedPerson}) =>{
    const [occupiedInterval,handleOccupiedInterval] = useState([]);
    useEffect(()=>{
        if(selectedDate === null || selectedPerson === null || selectedPerson === undefined || selectedDate === undefined){
            return;
        }
        let api_data = {
            selectedDate:selectedDate,
            person_id:selectedPerson
        }
        console.log(api_data);
        fetch("http://localhost:8080/api/get-person-occupied-time",{
            "method":"POST",
            "body":JSON.stringify(api_data),
            "headers":{
                "Content-type":"application/json"
            }
        })
        .then((response)=> response.json())
        .then((response)=>{
            if(response.status === true){
                handleOccupiedInterval(response.OccupiedInterval)
            }else{
                handleOccupiedInterval([])
            }
            console.log("Response",response);
        })
    },[selectedPerson])
    function ShowOccupiedIntervalMap(){
        return occupiedInterval.map((oI,index) => {
            <tr key={index}>
                <td>{oI.start.toString()}</td>
                <td>{oI.end.toString()}</td>
            </tr>
        })
    }
    console.log(occupiedInterval);
    if(selectedDate === null || selectedPerson === null || selectedPerson === undefined || selectedDate === undefined || occupiedInterval===undefined || occupiedInterval.length === 0){
        return <></>
    }else{
        return(<div>
            Clash
            <table>
                <th>
                    <td>Start Time</td>
                    <td>End Time</td>
                </th>
                {
                    occupiedInterval.map( (oI,index) =>( 
                        <tr key={index}>
                            <td>{oI.start.toString()}</td>
                            <td>{oI.end.toString()}</td>
                        </tr>)
                    )
                }
            </table>
            </div>)
    }
}

const ClashingPeople = ({clashArray,selectedDate})=>{
    const[clashingArray,handleClashingArray] = useState(clashArray);
    const [selectedPerson,handleSelectedPerson] = useState(null);
    
    useEffect(()=>{
        handleClashingArray(clashArray)
    },[clashArray])
    console.log("CLASHING ARRAY",clashingArray,clashingArray.length)


    if(clashingArray === null || clashingArray.length === 0 || clashingArray.length === undefined){
        return <></>
    }else{
        return (<div>
            Following people also have event at same time.Please reschedule it.
            <div>
                {clashingArray.map((ca)=> (
                    <div key={ca._id} onClick={(e) => handleSelectedPerson(ca._id)}>
                        {ca.name}
                    </div>
                ))}
            </div>
            <div>{}<ClashingTime selectedDate={selectedDate} selectedPerson={selectedPerson}/></div>
        </div>)
    }
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
                handleInterviewCreated(true)
            }else if(response.status === true && response.clash === true){
                handleClashingArray(response.clashArray)
            }else{
                handleErrors({
                    titleError:response.titleError,
                    intervieweeError:response.intervieweeError,
                    interviewerError:response.interviewerError,
                    timeError:response.timeError
                })
            }
        })
        
    
    }
    // function ShowClashingPeople(){
    //     if(clashingArray.length === 0){
    //         return <></>
    //     }else{
    //         return (<div>
    //             Following people also have event at same time.Please reschedule it.
    //             {clashingArray.map((val,index)=> (
    //                 <div key={index}>
    //                     {val}
    //                 </div>
    //             ))}
    //         </div>)
    //     }
    // }
    if(isInterviewCreated === false){
    return (
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
                            <input type="text" style={{height:'100%',width:'100%',padding:'1vh'}} value={eventData.title} onChange={(e)=>handleEventData({...eventData,title:e.target.value})} />
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
                            <textarea style={{height:'150px',width:'100%',padding:'1vh'}} value={eventData.description} onChange={(e)=>handleEventData({...eventData,description:e.target.value})}/>
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
                    <div className="mt-4">
                        <ClashingPeople clashArray={clashingArray} selectedDate={selectedDate} />
                    </div>
                </div>
            </div>
        </div>
    )}else{
        return (<div>
            Your Meeting saved
            <Link to="/">List all interview</Link>
            </div>)
    }
}


export default ScheduleInterview;