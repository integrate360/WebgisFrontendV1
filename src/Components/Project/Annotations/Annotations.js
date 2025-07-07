import React, { useContext, useEffect, useState } from "react";
import { AnnotationsContext } from "../../../context/Annotations";
import AnnotationItem from "./AnnotationItem";
import { useMap } from "../../../context/Map";

const Annotations = ({ height, map, source, width }) => {
  const { annotations } = useContext(AnnotationsContext);
  const [annotationsList, setAnnotationList] = useState([]);
  const [layerList, setLayerList] = useState([]);
  const [isAnnotationsOpen, setIsAnnotationsOpen] = useState(true); // Accordion for Annotations
  const [isLayersOpen, setIsLayersOpen] = useState(true); // Accordion for Layers

  useEffect(() => {
    const annot = annotations?.filter(
      (e) => !["kml", "kmz", "shp", "shz", "dxf"].includes(e?.type)
    );
    setAnnotationList(annot);
    const layers = annotations?.filter((e) =>
      ["kml", "kmz", "shp", "shz", "dxf"].includes(e?.type)
    );
    setLayerList(layers);
  }, [annotations]);

  return (
    <div
      id="sidebar"
      className="sidebar sidenav1"
      style={{
        height: height ? "calc(97vh - 147px)" : "calc(97vh - 48px)",
        width: `${width}%`,
      }}
    >
      {/* Annotations Accordion */}
      <p
        onClick={() => setIsAnnotationsOpen(!isAnnotationsOpen)}
        style={{ cursor: "pointer" }}
      >
        <i
          className={
            isAnnotationsOpen
              ? "fa-solid fa-chevron-down"
              : "fa-solid fa-chevron-right"
          }
          style={{ fontSize: "16px", marginRight: ".5rem", width: "16px" }}
        ></i>{" "}
        Annotations
      </p>
      {/* <hr className="light-hr" /> */}
      {isAnnotationsOpen && (
        <ul id="measurements" style={{ marginTop: ".5rem" }}>
          {annotationsList?.map((e, i) => (
            <AnnotationItem
              data={e}
              index={i}
              key={i}
              map={map}
              source={source}
            />
          ))}
        </ul>
      )}
      {/* <br /> */}

      {/* Layers Accordion */}
      {/* {layerList.length > 0 && ( */}
      {/* <> */}
      <p
        onClick={() => setIsLayersOpen(!isLayersOpen)}
        style={{ cursor: "pointer", marginTop: ".5rem" }}
      >
        <i
          className={
            isLayersOpen
              ? "fa-solid fa-chevron-down"
              : "fa-solid fa-chevron-right"
          }
          style={{ fontSize: "16px", marginRight: ".5rem", width: "16px" }}
        ></i>{" "}
        Layers
      </p>
      {/* <hr className="light-hr" /> */}
      {isLayersOpen && (
        <ul id="layers" style={{ marginTop: ".5rem" }}>
          {layerList?.map((e, i) => (
            <AnnotationItem
              data={e}
              index={i}
              key={i}
              map={map}
              source={source}
            />
          ))}
        </ul>
        // )}
        // </>
      )}
    </div>
  );
};

export default Annotations;
