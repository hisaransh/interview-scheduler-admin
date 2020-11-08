import {useState,useEffect} from 'react'
import {addDays,isAfter,isBefore,format,setMinutes,setHours,setSeconds,addMinutes} from 'date-fns'
import { id } from 'date-fns/locale';

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

export default ClashingPeople;