import React, { useContext } from "react";
import logo from "../assets/logo-w.png";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { extentionScrapper } from "../utils/Functions";
import { handleKmlKmzFiles } from "../utils/File/KmlKmz/KmlKmzFile";
import { handleShpFile } from "../utils/File/ShpShz/FileHandler";
import { handleDwgDxfFiles } from "../utils/File/DXF/DXfFile";
import { useMap } from "../context/Map";
import { useEditOptions } from "../context/editOptionsDetails";
import { useOrthoContext } from "../context/OrthoContext";
import { AnnotationsContext } from "../context/Annotations";

const Nav = ({ name, onProject = false }) => {
  const navigate = useNavigate();
  const { map, source } = useMap();
  const { storeUser, logout } = useUser();
  const { editOptions, setEditOptions } = useEditOptions();
  const { addStaticAnnotation, addAnnotation } = useContext(AnnotationsContext);
  const { projectDate } = useOrthoContext();
  const { orthoId } = useParams();

  const setEditOPtionHandler = (data) => {
    setEditOptions(data);
  };
  const addStaticAnnotationfunc = (data) => {
    addStaticAnnotation(data);
  };
  const setAnnotationFuntion = (annot) => {
    addAnnotation(annot);
  };
  const fileHandler = (e) => {
    for (let file of e.target.files) {
      const fileExtension = extentionScrapper(file?.name);
      switch (fileExtension) {
        case "kml":
        case "kmz":
          handleKmlKmzFiles(
            e,
            null,
            map,
            true,
            null,
            null,
            setEditOPtionHandler,
            source,
            addStaticAnnotationfunc,
            setAnnotationFuntion,
            orthoId
          );
          break;
        case "zip":
        case "shp":
          handleShpFile(
            e,
            map,
            null,
            setEditOPtionHandler,
            source,
            addStaticAnnotationfunc,
            setAnnotationFuntion,
            orthoId
          );
          break;
        case "dwg":
        case "dxf":
          handleDwgDxfFiles(
            e,
            map,
            null,
            null,
            null,
            setEditOPtionHandler,
            source,
            addStaticAnnotationfunc,
            setAnnotationFuntion,
            orthoId
          );
          break;
        default:
          console.log(
            "Unsupported file type:",
            fileExtension,
            setEditOPtionHandler
          );
      }
    }
  };
  return (
    <div className="topnav">
      <div className="flex logo-div">
        <div
          onClick={() => (window.location.href = "/projects")}
          style={{ display: "flex", cursor: "pointer" }}
        >
          <img src={logo} alt="Logo" width="60" />
          {/* <p className="logo">
            Think<b> Aerial</b>
          </p> */}
        </div>
        {onProject && (
          <>
            &nbsp;
            <div className="spacer"></div>
            &nbsp;
            <h4 className="project-name" id="project-name">
              {name}
            </h4>
            <h4 className="project-name" id="project-name">
              <i className="fas fa-chevron-right"></i>
            </h4>
            <h4 className="ortho-date" id="ortho-date">
              {projectDate}
            </h4>
          </>
        )}
      </div>
      <div className="flex topnav-second-div">
        {onProject && (
          <div className="file-input-wrapper">
            <label htmlFor="files" className="file-label">
              <i className="fa-regular fa-file"></i>Choose Files
            </label>
            <input
              type="file"
              multiple
              accept=".kml,.kmz,.zip,.shp,.dwg,.dxf"
              placeholder="files"
              id="files"
              className="file-input"
              onChange={(e) => fileHandler(e)}
            />
          </div>
        )}
        <button
          href="/Beforelogin/Login.html"
          className="logout-btn"
          id="logout-btn"
          onClick={() => {
            localStorage.removeItem("user");
            alert("Logout successful!");
            // navigate("/");
            storeUser(null);
            logout();
            navigate("/");
          }}
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i> &nbsp;Logout
        </button>
      </div>
    </div>
  );
};

export default Nav;
