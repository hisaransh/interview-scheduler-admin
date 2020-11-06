
import { useEffect,useState } from "react"
import{
    Link
    } from "react-router-dom"
    import {addDays,isAfter,isBefore,format,setMinutes,setHours,setSeconds,addMinutes} from 'date-fns'
import "./ListInterview.css"
import Navbar from "../Navbar"
export default function App(){
    const [meetingData,handleMeetingData] = useState(null);
    const [loading,handleLoading] = useState(true);
    useEffect(()=>{
        let api_data
        fetch("http://localhost:8080/api/get-meetings",{
            method:"POST",
            body:JSON.stringify(api_data),
            header:{
                "Content-Type":"application/json"
            }
        })
        .then(response => response.json())
        .then((response) =>{
            if(response.status === true){
                let meeting_api_data = response.data;
                meeting_api_data.sort(function(a,b){
                    return new Date(a.meeting_date)-new Date(b.meeting_date);
                });
                meeting_api_data = meeting_api_data.filter((mad) => {return isBefore(addDays(new Date(),-1),new Date(mad.meeting_date)) })
                console.log(meeting_api_data)
                handleMeetingData(meeting_api_data)
            }
        })
    },[])
    function getDate(dateStr){
        let month_names = ["January","Febuary","March","April","May","June","July","August","September","Octomber","November","December"]
        let event_date = new Date(dateStr);
        let date_string = event_date.getDate() + " " + month_names[event_date.getMonth()] + "," + event_date.getFullYear();
        return date_string
    }
    function getTime(dateStr){
        let event_date = new Date(dateStr);
        let hour = event_date.getHours();
        let minute = event_date.getMinutes();
        if(hour<=9){
            hour = "0" + hour.toString()
        }
        else{
            hour = hour.toString()
        }
        if(minute<=9){
            minute = "0" + minute.toString();
        }else{
            minute = minute.toString();
        }
        return hour + ":" + minute
    }
    
    function MeetingMap(){
        if(meetingData === null){
            return <></>
        }else if(meetingData.length === 0){
            return <div>There are no interview scheduled.</div>
        }else{
            return meetingData.map((md)=>(
                <div key={md._id} className="meeting-div">
                    <div className="meeting-title">{md.title}</div>
                    <div className="d-flex align-items-center">
                        <svg width="15px" height="15px" viewBox="0 0 16 16" className="bi bi-calendar-event" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                            <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                        </svg>
                        <div className="meeting-details" >{getDate(md.meeting_date)}</div>
                    </div>
                    <div className="d-flex align-items-center">
                        <svg width="15px" height="15px" viewBox="0 0 16 16" className="bi bi-clock" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm8-7A8 8 0 1 1 0 8a8 8 0 0 1 16 0z"/>
                            <path fill-rule="evenodd" d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
                        </svg>
                        <div className="meeting-details">{getTime(md.start_time)} - {getTime(md.end_time)}</div>
                    </div>
                    <Link to={{pathname:"/edit-interview",state:{data:md}}}  style={{ textDecoration: 'none' }}><div style={{color:'black'}}>Edit</div>
                    </Link>
                </div>
            ))
        }
    }
    console.log(meetingData);
    // console.log(typeof meetingData[0].meeting_date,getDate(meetingData[0].meeting_date))
    return(
        <div>
            <button type="button" class="btn btn-outline-primary"><Link className="nav-link"   to="/new-interview"><div>Schedule a new interview</div></Link></button>
            <div>
                {meetingData === null?(
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                ):(
                    <div className="container-div1 d-flex flex-column">
                        <div>
                        Upcoming Interviewes
                        </div>
                        <div className="d-flex flex-row flex-wrap mt-4">
                            <MeetingMap/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}