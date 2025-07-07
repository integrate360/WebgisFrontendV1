import React, { useState, useEffect, useContext } from "react";
import Nav from "../Components/Nav";
import DropIt from "../Components/Project/DropIt";
import Main from "../Components/Project/Main";
import ToolTips from "../Components/Project/ToolTips";
import BottomNav from "../Components/Project/BottomNav";
import SecondNav from "../Components/Project/SecondNav";
import "../styles/Home.css";
import axios from "axios";
import { api } from "../config";
import { useParams } from "react-router-dom";
import { AnnotationsContext } from "../context/Annotations";
import { useMap } from "../context/Map";
import { useOrthoContext } from "../context/OrthoContext";
import { updateGeoTIFFLayer } from "../utils/map";
import { useEditOptions } from "../context/editOptionsDetails";
import moment from "moment";
import { getAnnotationToOrtho, sortDatesAscending } from "../utils/Functions";
const Project = () => {
  const [dates, setDates] = useState();
  const [firstOrtoLayer, setFirstOrthoLayer] = useState();
  const params = useParams();
  const { updateAnnotation } = useContext(AnnotationsContext);
  const { setOrtho, setUrl, setProjectDate } = useOrthoContext();
  const [name, setName] = useState("");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${api}arthouses/project/${params.id}`);
      if (!data?.length) return;

      setOrtho(data);
      console.log(data);

      const dates = data.map((item) => item.date);
      const sortedDates = sortDatesAscending(dates);

      const annot = await getAnnotationToOrtho(params.orthoId);
      if (annot) {
        updateAnnotation(annot.annotations);
        localStorage.setItem("orthoId", annot._id);
        localStorage.setItem("orthoUrl", annot.images[0]);
        setUrl(annot.images[0] || "");
      }

      setDates(sortedDates);
      setName(annot?.ProjectId?.name);
      setProjectDate(moment(annot?.date).format("YYYY-MM-DD"));
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div id="view-gis">
      <DropIt />
      <Nav name={name} onProject={true} />
      <SecondNav dates={dates} />

      {/* <ToolTips /> */}
      <Main />
      <BottomNav />
    </div>
  );
};

export default Project;
