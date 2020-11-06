
import ScheduleInterview from "./Pages/ScheduleInterview"
import ListInterview from "./Pages/ListInterview"
import Navbar from "./Pages/Navbar"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
function App() {
  return (
    <Router>
      <Navbar/>
        <Switch>
          <Route path="/new-interview" exact>
                <ScheduleInterview/>
          </Route>
        <Route path="/">
              <ListInterview/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
