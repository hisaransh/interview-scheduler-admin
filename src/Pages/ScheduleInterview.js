import './ScheduleInterview.css'
import {useState} from 'react'
import MultiSelect from "react-multi-select-component";

const MultiSelectInterviwee = () => {
    const options = [
        { label: "Grapes 🍇", value: "grapes" },
        { label: "Mango 🥭", value: "mango" },
        { label: "Strawberry 🍓", value: "strawberry", disabled: true },
        { label: "Watermelon 🍉", value: "watermelon" },
        { label: "Pear 🍐", value: "pear" },
        { label: "Apple 🍎", value: "apple" },
        { label: "Tangerine 🍊", value: "tangerine" },
        { label: "Pineapple 🍍", value: "pineapple" },
        { label: "Peach 🍑", value: "peach" },
      ];
     
      const [selected, setSelected] = useState([]);
     
      return (
        <div>
          <MultiSelect
            options={options}
            value={selected}
            onChange={setSelected}
            labelledBy={"Select"}
            isLoading={false}
          />
        </div>
      );
}

const ScheduleInterview = () => {
    return (
        <div>
            <nav className="navbar navbar-light bg-light">
                <a className="navbar-brand" href="#">Navbar</a>
            </nav>
            <div className="container-div1 d-flex flex-column">
                <div>
                        Lets Schedule a interview
                </div>
                <div className="mt-2">
                    <div className="mt-2">
                        <div>
                            Title
                        </div>
                        <div className="mt-1">
                            <input type="text"/>
                        </div>
                    </div>
                    <div className="mt-2">
                        <div>
                            Select Interviewer
                        </div>
                        <div>
                            <MultiSelectInterviwee/>
                        </div>
                    </div>
                    <div className="mt-2">
                        <div>
                            Select Interviewee
                        </div>
                        <div>
                            <MultiSelectInterviwee/>
                        </div>
                    </div>
                    <div className="mt-2">
                        <div>
                            Choose Dates
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default ScheduleInterview;