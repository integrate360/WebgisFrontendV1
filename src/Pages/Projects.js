import axios from "axios";
import React, { useEffect, useState } from "react";
import { api } from "../config";
import ProjectsCard from "../Components/Projects/ProjectsCard";
import "../styles/Projects.css";
import Nav from "../Components/Nav";
import { useUser } from "../context/UserContext";
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")).user;
  const fetch = async () => {
    try {
      const { data } = await axios.get(`${api}projects/user/${user?._id}`);
      setProjects(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="projects">
      <Nav />
      <div className="projects-cards-div">
        {projects.length <= 0 && (
          <p
            style={{
              color: "white",
              height: "80vh",
              width: "80vw",
              display: "grid",
              placeItems: "center",
            }}
          >
            No Porjects Yet!
          </p>
        )}
        {projects.map((e) => (
          <ProjectsCard key={e._id} item={e} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
