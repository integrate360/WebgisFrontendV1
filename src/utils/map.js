import { Feature, Overlay } from "ol";
import { LineString, Point, Polygon } from "ol/geom";
import { Fill, Icon, Stroke, Style } from "ol/style";
import { useMap } from "../context/Map";
import {
  addAnnotationToOrtho,
  createListItem,
  deleteAnnotationToOrtho,
  extentionScrapper,
  handleSideNavItemClick,
  serializeFeature,
  stringShortner,
  updateListItemStyles,
} from "./Functions";
import CircleStyle from "ol/style/Circle";
import { convertUnit, formatArea, formatLength } from "./measurements";
import { getLength, getArea } from "ol/sphere";
// import { GeoTIFF, XYZ } from "ol/source";
import TileLayer from "ol/layer/Tile";
import { handleKmlKmzFiles } from "./File/KmlKmz/KmlKmzFile";
import { GeoTIFF } from 'ol/source';
import WebGLTileLayer from 'ol/layer/WebGLTile';
export function createPinFeature(coords) {
  if (!coords) return;
  const pinFeature = new Feature({
    geometry: new Point(coords),
    name: "New Pin",
  });

  const pinStyle = new Style({
    image: new Icon({
      src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      scale: 0.04,
      anchor: [0.5, 1],
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
    }),
  });

  pinFeature?.setStyle(pinStyle);
  pinFeature?.set("storedStyle", style);
  return pinFeature;
}

export function deserializeFeature(data, isPolygon) {
  let geometry;

  // Check geometry type and create accordingly
  if (data.type === "Polygon") {
    geometry = new Polygon(data.coordinates);
  } else if (data.type === "LineString") {
    geometry = new LineString(data.coordinates);
  } else {
    // throw new Error("Unsupported geometry type: " + data.type);
  }

  // Create the feature with the geometry
  const feature = new Feature(geometry);
  feature?.setId(data.id);
  feature?.set("featureId", data?.featureId);

  // Create and set the style
  const style = new Style({
    stroke: new Stroke({
      color: data.style?.strokeColor,
      width: 1,
    }),
    fill: data.style?.fillColor
      ? new Fill({
          color: data.style?.fillColor,
        })
      : null,
    // ...(isPolygon && {
    //   fill: new Fill({
    //     color: `${data.style?.fillColor}${Math.round(
    //       data.style?.fillOpacity * 255
    //     )
    //       .toString(16)
    //       .padStart(2, "0")}`,
    //   }),
    // }),
  });
  feature?.setStyle(style);
  feature?.set("storedStyle", style);

  // Set additional properties
  if (data.properties) {
    feature?.setProperties(data.properties.geometry);
  }

  return feature;
}

export function handleCheckboxChange(featureID, isChecked, source, id) {
  const feature = source?.getFeatureById(featureID);
  if (!feature) return;
  const element = document.querySelector('[overlay-featureId="' + id + '"]');

  if (isChecked) {
    const storedStyle = feature?.get("storedStyle") || null;
    showMeasumentLabels(id);
    feature?.setStyle(storedStyle);
  } else {
    if (element) element.style.display = "none";
    feature?.set("storedStyle", feature?.getStyle());
    feature?.setStyle(new Style());
  }
}
async function handleDeleteBtnClick(listItem, featureID, source) {
  const editOptions = document.getElementById("edit-options");
  const measurementsList = document.getElementById("measurements");
  editOptions.innerHTML = "";
  measurementsList.removeChild(listItem);
  const feature = source?.getFeatureById(featureID);
  if (feature) {
    source?.removeFeature(feature);
  }
  await deleteAnnotationToOrtho(featureID);
  updateRemainingListItems();
}
function updateRemainingListItems() {
  const measurementsList = document.getElementById("measurements");
  const remainingItems = measurementsList.querySelectorAll("li");
  remainingItems.forEach((item, newIndex) => {
    item
      .querySelector("input[type='checkbox']")
      .setAttribute("data-index", newIndex);
    item.setAttribute("value", newIndex);
  });
}
export function centerMapOnFeature(geom, map) {
  const extent = geom.extent_;
  const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
  map.getView().setCenter(center);
  map.getView().fit(extent);
}
export function localCenterMapOnFeature(geom, map) {
  const extent = geom.getExtent();
  const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
  map.getView().setCenter(center);
  map.getView().fit(extent);
}
export async function addPin(
  coords,
  map,
  source,
  orthoId,
  editOption,
  setAnnotationFuntion,
  addStaticAnnotation,
  featureID
) {
  const pinFeature = createPinFeature(coords);
  pinFeature?.setId(featureID);
  pinFeature?.set("label", "Pin");
  pinFeature?.set("featureId", featureID);
  source?.addFeature(pinFeature);
  pinFeature?.setProperties({
    featureId: featureID,
    label: "Pin",
  });
  setAnnotationFuntion({
    data: { lable: "Pin", id: featureID, coords },
    label: "Pin",
    feature: pinFeature,
    featureID,
    featureId: featureID,
    type: "pin",
  });
  editOption({
    data: { lable: "Pin", id: featureID, coords },
    label: "Pin",
    feature: pinFeature,
    featureID,
    featureId: featureID,
    type: "pin",
  });
  // handleSideNavItemClick(pinFeature, source, featureID);

  // send to backend
  addAnnotationToOrtho(orthoId, {
    featureId: featureID,
    data: { coords, id: featureID, label: "Pin" },
    type: "pin",
  });
}
const style = new Style({
  style: new Style({
    fill: new Fill({
      color: "rgba(68, 138, 255, 0.4)",
    }),
    stroke: new Stroke({
      color: "#448aff",
      width: 2,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: "#448aff",
      }),
    }),
  }),
});
// Handle drawing end event
export async function handleDrawEnd(
  event,
  isPolygon,
  measureTooltip,
  tooltip,
  source,
  map,
  orthoId,
  editOption,
  setAnnotationFuntion,
  addStaticAnnotation,
  annotations,
  featureID
) {
  tooltip.innerHTML = "";
  const geom = event.feature?.getGeometry();
  const unit = document.getElementById("unitConversion").value;
  const measurmentValue = isPolygon ? getArea(geom) : getLength(geom);
  const output = isPolygon ? formatArea(geom, unit) : formatLength(geom, unit);
  const convertedOutput = convertUnit(output, unit, isPolygon);
  const label = isPolygon ? "Polygon" : "Line";
  event?.feature?.set("label", label);
  event?.feature?.set("measurement", convertedOutput);
  event?.feature?.set("orthoId", orthoId);
  event?.feature?.set("featureId", featureID);
  const serializing = serializeFeature(event.feature, featureID);

  event.feature?.setProperties({
    featureId: featureID,
    label: label,
    measurement: convertedOutput,
    orthoId: orthoId,
    output: output,
  });
  const featureData = {
    ...serializing,
    featureID: featureID,
    label: event.feature?.get("label"),
    measurement: event.feature?.get("measurement"),
    orthoId: event.feature?.get("orthoId"),
    output: event.feature?.get("output"),
  };
  // ...annotations,
  setAnnotationFuntion({
    type: isPolygon ? "polygon" : "line",
    featureId: featureID,
    data: {
      label,
      geom,
      measurement: measurmentValue,
      convertedOutput,
      id: featureID,
      ...featureData,
    },
  });
  editOption({
    label,
    geom,
    convertedOutput,
    isPolygon,
    featureID,
    measurement: measurmentValue,
    featureData,
    type: isPolygon ? "polygon" : "line",
  });
  // Reapply hidden styles
  const checkboxes = document.querySelectorAll(".measurement-checkbox");
  checkboxes.forEach((cb) => {
    const id = cb.closest("li").getAttribute("data-feature-id");
    handleCheckboxChange(id, cb.checked, source);
  });

  // send to backend
  await addAnnotationToOrtho(orthoId, {
    featureId: featureID,
    data: featureData,
    type: isPolygon ? "polygon" : "line",
  });
}
export function updateGeoTIFFLayer(newUrl, map, source, setAnnotationFuntion) {
  const fileExtension = extentionScrapper(newUrl);
  if (fileExtension === "tif") {
    const newGeotiffSource = new GeoTIFF({
      sources: [
        {
          url: newUrl,
        },
      ],
      convertToRGB: true,
      interpolate: true,
    });

    const geotiffLayer = new WebGLTileLayer({
      source: newGeotiffSource,
    });

    map?.getLayers()?.insertAt(2, geotiffLayer);

    newGeotiffSource.getView().then((viewOptions) => {
      const extent = viewOptions.extent;
      const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
      map.getView().setCenter(center);
      map.getView().fit(extent);
    });
  } else if (["kml", "kmz"].includes(fileExtension)) {
    handleKmlKmzFiles(
      null,
      newUrl,
      map,
      false,
      "1",
      "Ortho",
      () => {},
      source,
      () => {},
      setAnnotationFuntion
    );
  }
}
export const listItemStyleChange = (id) => {
  const layerItems = document.querySelectorAll("#layers li");
  const measurementItems = document.querySelectorAll("#measurements li");
  [...measurementItems, ...layerItems]?.forEach((item) => {
    // Remove all classes from the item
    item.className = ""; // Removes all existing classes

    // Check if the item's data-feature-id matches the given id
    if (item.getAttribute("data-feature-id") === id) {
      item.classList.add("select"); // Add the "selected" class
    }
  });
};

export const createMeasurementOverlay = (
  measurement = "",
  center,
  featureId
) => {
  const element = document.createElement("div");
  element.className = "measurement-label";
  element.setAttribute("overlay-featureId", featureId);
  element.style.display = "none";
  element.style.padding = "3px 6px";
  element.style.borderRadius = "3px";
  element.style.backgroundColor = "white";
  element.innerHTML = `
    <div style="font-size:18px;text-shadow: 
    1px 1px 0 white,  
    -1px -1px 0 white, 
    1px -1px 0 white, 
    -1px 1px 0 white;" id='overlay-text-${featureId}'>
      ${measurement ?? ""}
    </div>
  `;
  return new Overlay({
    element: element,
    position: center,
    positioning: "center-center",
    id: `overlay-${featureId}`,
    // offset: [0, 100],
  });
};

export const createPinOverlay = (measurement = "", center, featureId) => {
  const element = document.createElement("div");
  element.className = "measurement-label";
  element.setAttribute("overlay-featureId", featureId);
  element.style.display = "none";
  element.style.padding = "3px 6px";
  element.style.borderRadius = "3px";
  element.style.backgroundColor = "white";
  element.innerHTML = `
    <div style="font-size:18px;text-shadow: 
    1px 1px 0 white,  
    -1px -1px 0 white, 
    1px -1px 0 white, 
    -1px 1px 0 white;" id='overlay-text-${featureId}'>
      ${measurement ?? ""}
    </div>
  `;

  return new Overlay({
    element: element,
    position: center,
    positioning: "center-center",
    offset: [0, -30],
    id: `overlay-${featureId}`,
  });
};

export const showMeasumentLabels = (featureId) => {
  const measurementLabels = document.querySelectorAll(".measurement-label");
  measurementLabels?.forEach((e) => (e.style.display = "none"));
  const element = document.querySelector(
    '[overlay-featureId="' + featureId + '"]'
  );
  if (element) element.style.display = "block";
};

export const updateOverlayPosition = (
  map,
  featureId,
  newPosition,
  measurement
) => {
  const overlay = map?.getOverlayById(`overlay-${featureId}`);
  const measurementText = document.getElementById(`overlay-text-${featureId}`);
  if (measurementText) measurementText.innerText = measurement;
  if (overlay) {
    overlay.setPosition(newPosition);
  } else {
    console.error(`Overlay with featureId: ${featureId} not found.`);
  }
};
