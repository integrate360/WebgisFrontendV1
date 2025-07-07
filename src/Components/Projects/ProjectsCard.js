import axios from "axios";
import React, { useEffect } from "react";
import "ol/ol.css"; // OpenLayers CSS
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { OSM } from "ol/source";
import { KML } from "ol/format";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { useNavigate } from "react-router-dom";

const ProjectsCard = ({ item }) => {
  const navigate = useNavigate();
  const stringShortner = (string) => {
    if (string?.length > 200) {
      return string.substring(0, 200) + "..";
    } else {
      return string;
    }
  };
  return (
    <div
      className="project-card"
      onClick={() => {
        localStorage.setItem("projectId", item?._id);
        navigate(`/project/${item?._id}/${item?.arthouse}`);
      }}
    >
      {/* <img src={item.images[0]} alt={item.name} /> */}
      {/* <div id={item._id} style={{ width: "100%", height: "400px" }}></div> */}
      <h1>{item.name}</h1>
      <h3>{item.companyId?.name}</h3>
      <p>{item.companyId?.contactInfo}</p>
      <br />
      <p>{stringShortner(item.description)}</p>
      {/* <p>{item.companyId?.description}</p> */}
    </div>
  );
};

export default ProjectsCard;
