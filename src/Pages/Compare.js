import React, { useEffect, useRef, useState } from "react";
import DivCompare from "../Components/Compare/DivCompare";
import VectorLayer from "ol/layer/Vector";
import TileLayer from "ol/layer/Tile";
import { Map, View } from "ol";
import { get as getProjection } from "ol/proj";
import { OSM, XYZ } from "ol/source";
import { GeoTIFF } from "ol/source";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import {
  getAnnotationToOrtho,
  removeSelectedCompareStyle,
  removeSelectedStyle,
} from "../utils/Functions";
import { useParams } from "react-router-dom";
import { updateGeoTIFFLayer } from "../utils/map";
import VectorSource from "ol/source/Vector";
import { fetchAnnotationToMap } from "../utils/Compare/annotations";
import AnnotationsDivCompare from "../Components/Compare/Annotation/AnnotationsDivCompare";
import CompareNav from "../Components/Compare/CompareNav";
import SideNav from "../Components/Project/SideNav2/SideNav";
import "../styles/Compare.css";
import CompareSideNav from "../Components/Compare/SideNav/CompareSideNav";
import { useOrthoContext } from "../context/OrthoContext";
import { api } from "../config";
import axios from "axios";
import { useEditOptions } from "../context/editOptionsDetails";
function Compare() {
  const [sideNavOneVisible, setSideNavOneVisible] = useState(true);
  const [sideNavTwoVisible, setSideNavTwoVisible] = useState(false);
  const [annotation1, setAnnotation1] = useState([]);
  const [annotation2, setAnnotation2] = useState([]);
  const [map1, setMap1] = useState();
  const [map2, setMap2] = useState();
  const [source1, setSource1] = useState();
  const [source2, setSource2] = useState();
  const [image1, setImage1] = useState();
  const [image2, setImage2] = useState();
  const { setOrtho, setUrl, setProjectDate } = useOrthoContext();
  const [side1Width, setSide1Width] = useState(26);
  const containerRef = useRef(null);
  const { setEditOptions } = useEditOptions();

  const [side2Width, setSide2Width] = useState(26);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const params = useParams();
  const handleMouseMove = (e) => {
    if (!isDraggingLeft && !isDraggingRight) return;

    const container = containerRef.current;
    if (!container) return;

    const bounds = container.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const containerWidth = bounds.width;

    if (isDraggingLeft) {
      const newWidth = (mouseX / containerWidth) * 100;
      setSide1Width(Math.min(Math.max(newWidth, 20), 40));
    }

    if (isDraggingRight) {
      const fromRight = containerWidth - mouseX;
      const newWidth = (fromRight / containerWidth) * 100;
      setSide2Width(Math.min(Math.max(newWidth, 20), 40));
    }
  };
  const handleMouseUp = () => {
    setIsDraggingLeft(false);
    setIsDraggingRight(false);
    document.body.style.userSelect = "";
  };
  const handleMouseDownLeft = () => {
    setIsDraggingLeft(true);
    document.body.style.userSelect = "none"; // Disable text selection
  };

  const handleMouseDownRight = () => {
    setIsDraggingRight(true);
    document.body.style.userSelect = "none"; // Disable text selection
  };
  const getannotations = async () => {
    const a1 = await getAnnotationToOrtho(params.id1);
    const a2 = await getAnnotationToOrtho(params.id2);
    setImage1(a1.images[0]);
    setImage2(a2.images[0]);
    setAnnotation1(a1.annotations);
    setAnnotation2(a2.annotations);
    return {
      image: [a1.images[0], a2.images[0]],
      annotation: [a1.annotations, a2.annotations],
    };
  };
  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${api}arthouses/project/${params.id}`);
      if (data.length <= 0) return;
      setOrtho(data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };
  useEffect(() => {
    const initializeMap = async () => {
      await fetchData();
      const data = await getannotations(); // Ensure annotations are fetched before setting up the map

      proj4.defs(
        "EPSG:32643",
        "+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs"
      );
      register(proj4);

      const sources1 = new VectorSource({
        sources: [
          {
            url: "https://gisdemo.s3.ap-south-1.amazonaws.com/mahalaxmicog.tif",
          },
        ],
      });
      const sources2 = new VectorSource({
        sources: [
          {
            url: "https://gisdemo.s3.ap-south-1.amazonaws.com/mahalaxmicog.tif",
          },
        ],
      });

      const vectorLayer1 = new VectorLayer({ source: sources1, zIndex: 10 });
      const vectorLayer2 = new VectorLayer({ source: sources2, zIndex: 10 });

      const mapLayer1 = new TileLayer({ source: new OSM() });
      const mapLayer2 = new TileLayer({ source: new OSM() });
      const maptiler1 = new TileLayer({
        source: new XYZ({
          url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=MhHCXdXiS76dHZwSbsGf",
          // url: "https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=8nzRK8UcDsUE8AZWwQh2",
        }),
      });
      const maptiler2 = new TileLayer({
        source: new XYZ({
          url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=MhHCXdXiS76dHZwSbsGf",
          // url: "https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=8nzRK8UcDsUE8AZWwQh2",
        }),
      });
      const utmProjection = getProjection("EPSG:32643");

      const view1 = new View({
        projection: utmProjection,
        center: [20.5937, 78.9629],
        zoom: 4,
      });

      const view2 = new View({
        projection: utmProjection,
        center: [20.5937, 78.9629],
        zoom: 4,
      });

      // Create or replace the maps
      let olMap, olMap2;
      if (map1 && map2) {
        // If maps already exist, clear their layers and views
        map1.setLayers([]);
        map2.setLayers([]);
        olMap = map1;
        olMap2 = map2;
      } else {
        olMap = new Map({
          target: "map1",
        });
        olMap2 = new Map({
          target: "map2",
        });
      }

      // Set new layers and views
      olMap.setView(view1);
      olMap.addLayer(mapLayer1);
      olMap.addLayer(vectorLayer1);
      olMap.addLayer(maptiler1);

      olMap2.setView(view2);
      olMap2.addLayer(mapLayer2);
      olMap2.addLayer(vectorLayer2);
      olMap2.addLayer(maptiler2);

      olMap.on("click", function (evt) {
        if (evt.dragging) return;
        const measurementItems = document.querySelectorAll("#measurements li");
        const layerItems = document.querySelectorAll("#layers li");
        [...measurementItems, ...layerItems]?.forEach((item) => {
          // Remove all classes from the item
          item.className = ""; // Removes all existing classes
        });
        setEditOptions();
        // removeSelectedStyle(source2);
        // removeSelectedStyle(source1);
      });
      olMap2.on("click", function (evt) {
        if (evt.dragging) return;
        const measurementItems = document.querySelectorAll("#measurements li");
        const layerItems = document.querySelectorAll("#layers li");
        [...measurementItems, ...layerItems]?.forEach((item) => {
          // Remove all classes from the item
          item.className = ""; // Removes all existing classes
        });
        setEditOptions();
        // removeSelectedStyle(source2);
        // removeSelectedStyle(source1);
      });
      // Synchronize views
      let updatingView1 = false;
      let updatingView2 = false;

      const syncView1ToView2 = () => {
        if (!updatingView2) {
          updatingView1 = true;
          view2.setCenter(view1.getCenter());
          view2.setZoom(view1.getZoom());
          updatingView1 = false;
        }
      };

      const syncView2ToView1 = () => {
        if (!updatingView1) {
          updatingView2 = true;
          view1.setCenter(view2.getCenter());
          view1.setZoom(view2.getZoom());
          updatingView2 = false;
        }
      };

      view1.on("change:center", syncView1ToView2);
      view1.on("change:resolution", syncView1ToView2);
      view2.on("change:center", syncView2ToView1);
      view2.on("change:resolution", syncView2ToView1);

      setMap1(olMap);
      setMap2(olMap2);
      setSource1(sources1);
      setSource2(sources2);

      // Fetch annotation for each map
      fetchAnnotationToMap(olMap, sources1, data.annotation[0]);
      fetchAnnotationToMap(olMap2, sources2, data.annotation[1]);
      // get orthoImages on both mapes
      updateGeoTIFFLayer(data.image[0], olMap, sources1);
      updateGeoTIFFLayer(data.image[1], olMap2, sources2);
      // Cleanup on component unmount
      return () => {
        olMap.setTarget(null);
        olMap2.setTarget(null);
      };
    };
    setEditOptions();

    initializeMap();
  }, [params.id, params.id1, params.id2]); // Only re-run when these params change

  const toggleSideNavOne = () => {
    setSideNavOneVisible(!sideNavOneVisible);
  };

  const toggleSideNavTwo = () => {
    setSideNavTwoVisible(!sideNavTwoVisible);
  };
  const existInBoth = () => {
    const lId = localStorage.getItem("compare-annotation-id");
    let value = false;
    const filter = annotation1.filter((e) => {
      if (e._id == lId) value = true;
    });
    if (value) {
      const newFilter = annotation2.filter((e) => {
        if (e._id == lId) value = true;
      });
    }
    return value;
  };
  const existInAnnotaiton = (id) => {
    const filter = annotation1.filter((e) => {
      if (e._id == id) return true;
    });
    return false;
  };
  return (
    <div
      className="compare"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <CompareNav setEditOptions={() => setEditOptions()} />
      <div className="compare-main">
        {sideNavOneVisible && (
          <>
            <div
              className="resize-handle left"
              style={{
                height: "calc(-44px + 100vh)",
                left: `${side1Width}%`,
                zIndex: 1,
              }}
              onMouseDown={() => {
                setIsDraggingLeft(true);
                handleMouseDownLeft();
              }}
            />
            <AnnotationsDivCompare
              a1={annotation1}
              a2={annotation2}
              m1={map1}
              m2={map2}
              s1={source1}
              s2={source2}
              width={side1Width}
            />
          </>
        )}
        <div
          className="collapse-left"
          id="collapse-left"
          onClick={toggleSideNavOne}
          style={{ left: sideNavOneVisible ? `${side1Width}%` : "0%" }}
        >
          {sideNavOneVisible ? (
            <i className="fas fa-chevron-left"></i>
          ) : (
            <i className="fas fa-chevron-right"></i>
          )}
        </div>
        <DivCompare
          left={
            <div
              id="map2"
              style={{
                height: " calc(100vh - 44px)",
                width: sideNavOneVisible ? "80vw" : "100vw",
                // backgroundColor: "green",
              }}
            ></div>
          }
          right={
            <div
              id="map1"
              style={{
                height: " calc(100vh - 44px)",
                width: sideNavOneVisible ? "80vw" : "100vw",
                // backgroundColor: "blue",
              }}
            ></div>
          }
        />
        {/* <div
          className="collapse-right"
          id="collapse-right"
          onClick={toggleSideNavTwo}
          style={{ right: sideNavTwoVisible ? `${side2Width}%` : "0%" }}
        >
          {sideNavTwoVisible ? (
            <i className="fas fa-chevron-right"></i>
          ) : (
            <i className="fas fa-chevron-left"></i>
          )}
        </div> */}
        {/* {sideNavTwoVisible && ( */}
        {/* <div
          id="show-compare-sidenav-two"
          style={{ display: sideNavTwoVisible ? "block" : "none" }}
        >
          <div
            className="resize-handle right"
            style={{
              height: "calc(-44px + 100vh)",
              right: `${side2Width}%`,
            }}
            onMouseDown={() => {
              setIsDraggingRight(true);
              handleMouseDownRight();
            }}
          />
          <CompareSideNav
            map={
              existInAnnotaiton(localStorage.getItem("compare-annotation-id"))
                ? map1
                : map2
            }
            source={
              existInAnnotaiton(localStorage.getItem("compare-annotation-id"))
                ? source1
                : source2
            }
            width={side2Width}
          />
        </div> */}
        {/* )} */}
      </div>
    </div>
  );
}

export default Compare;
