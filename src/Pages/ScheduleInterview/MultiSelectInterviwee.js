import {useState,useEffect} from 'react'
import MultiSelect from "react-multi-select-component";
import {addDays,isAfter,isBefore,format,setMinutes,setHours,setSeconds,addMinutes} from 'date-fns'
import { id } from 'date-fns/locale';

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

export default MultiSelectInterviwee