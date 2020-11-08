
import ScheduleInterview from "./Pages/ScheduleInterview/ScheduleInterview"
import ListInterview from "./Pages/ListInterview"
import EditInterview from "./Pages/ListInterview/EditInterview"
import Navbar from "./Pages/Navbar"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <Router>
      <Navbar/>
        <Switch>
          <Route path="/new-interview" exact>
                <ScheduleInterview/>
          </Route>
          <Route path="/edit-interview" exact>
                <EditInterview/>
          </Route>
          <Route path="/">
                <ListInterview/>
          </Route>
      </Switch>
    </Router>
  );
}

export default App;
