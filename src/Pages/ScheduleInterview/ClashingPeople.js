import {useState,useEffect} from 'react'
import {addDays,isAfter,isBefore,format,setMinutes,setHours,setSeconds,addMinutes} from 'date-fns'
import { id } from 'date-fns/locale';

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
    console.log("-----------",hour,minute,dateStr)
    return hour + ":" + minute
}

const ClashingTime = ({selectedDate,selectedPerson}) =>{
    const [occupiedInterval,handleOccupiedInterval] = useState([]);
    const [isLoading,handleIsLoading] = useState(false);
    useEffect(()=>{
        handleIsLoading(true);
        if(selectedDate === null || selectedPerson === null || selectedPerson === undefined || selectedDate === undefined){
            handleIsLoading(false);
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
            handleIsLoading(false);
            
        })
    },[selectedPerson])
    function ShowOccupiedIntervalMap(){
        return occupiedInterval.map((oI,index) => {
            <tr key={index}>
                <td>{getTime(oI.start)}</td>
                <td>{getTime(oI.end)}</td>
            </tr>
        })
    }
    if(selectedDate === null || selectedPerson === null || selectedPerson === undefined || selectedDate === undefined || occupiedInterval===undefined || occupiedInterval.length === 0){
        return <></>
    }else{
        return(<div>
            {isLoading===true?(
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            ):(
                <table>
                <thead>
                    <tr>
                    <td>Start Time</td>
                    <td>End Time</td>
                    </tr>
                </thead>
                <tbody>
                {
                    occupiedInterval.map( (oI,index) =>( 
                        <tr key={index}>
                            <td>{getTime(oI.start)}</td>
                            <td>{getTime(oI.end)}</td>
                        </tr>)
                    )
                }
                </tbody>
            </table>
            )}
            
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
        return (
            <div className='mt-4 clashing-people-div1 d-flex flex-column'>
                <div style={{alignSelf:'center',fontSize:'20px',fontWeight:'bold'}}>Following people also have event at same time.Please reschedule it.</div>
                <div className="mt-3">
                    <ul>
                    {clashingArray.map((ca)=> (
                        <li className="person-list" key={ca._id} onClick={(e) => handleSelectedPerson(ca._id)}>
                            {ca.name}
                        </li>
                    ))}
                    </ul>
                </div>
            <div><ClashingTime selectedDate={selectedDate} selectedPerson={selectedPerson}/></div>
        </div>
    )
    }
}

export default ClashingPeople;