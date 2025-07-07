import Project from "./Pages/Project";
import Projects from "./Pages/Projects";
import Login from "./Pages/Login";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "./context/UserContext";
import Compare from "./Pages/Compare";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  useEffect(() => {
    // Check if user is logged in
    if (
      user ||
      localStorage.getItem("user") != null ||
      localStorage.getItem("user") != undefined
    ) {
      setLoggedIn(true);
      if (window.location.pathname === "/") {
        navigate("/projects");
      }
    } else {
      setLoggedIn(false);
      navigate("/"); // Redirect to login page if not logged in
    }
  }, [user]);

  return (
    <div className="App">
      <Routes>
        {loggedIn ? (
          <>
            {/* Protected routes */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:id/:orthoId" element={<Project />} />
            <Route path="/compare/:id/:id1/:id2" element={<Compare />} />
            {/* <Route path="*" element={<Projects />} /> */}
            {/* Redirect to projects if any invalid path */}
          </>
        ) : (
          <>
            {/* Only allow login page when not logged in */}
            <Route path="*" element={<Login />} />
            <Route path="/" element={<Login />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
