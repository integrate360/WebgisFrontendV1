import { addAnnotationToOrtho } from "../../Functions";
import Map from "ol/Map";
import {
  addKmlToMap,
  extractKmlFromKmz,
  fetchFileFromUrl,
  fetchKmlFromPresignedUrl,
  readFileAsText,
} from "./KmlKmzFunctions";

export async function handleKmlKmzFiles(
  event,
  presignedUrl = null,
  map,
  ortho = true,
  id = null,
  lable = null,
  setEditOptions,
  source,
  addStaticAnnotation,
  setAnnotationFuntion = () => {},
  orthoId = ""
) {
  if (presignedUrl) {
    try {
      const fileExtension = presignedUrl.split(".").pop().toLowerCase();
      let kmlContent;

      if (fileExtension === "kmz") {
        const blob = await fetchFileFromUrl(presignedUrl);
        kmlContent = await extractKmlFromKmz(blob);
      } else if (fileExtension === "kml") {
        kmlContent = await fetchKmlFromPresignedUrl(presignedUrl);
      } else {
        throw new Error("Unsupported file type");
      }
      addKmlToMap(
        fileExtension,
        kmlContent,
        lable,
        map,
        ortho,
        id,
        true,
        setEditOptions,
        source,
        addStaticAnnotation,
        setAnnotationFuntion
      );
    } catch (error) {
      console.error("Error processing presigned KML:", error);
    }
  } else if (event && event.target.files) {
    const files = event.target.files;
    for (let file of files) {
      try {
        let kmlContent;
        let type;
        if (file.name.toLowerCase().endsWith(".kmz")) {
          kmlContent = await extractKmlFromKmz(file);
          type = "kmz";
        } else {
          kmlContent = await readFileAsText(file);
          type = "kml";
        }
        const formData = new FormData();
        const featureID = "feature-" + Date.now();
        const obj = { id: featureID, name: file.name, label: file.name };
        formData.append("data", obj);
        formData.append("file", file);
        formData.append("id", featureID);
        formData.append("label", file.name);
        formData.append("type", type);
        formData.append("featureId", featureID);
        await addAnnotationToOrtho(orthoId, formData);
        addKmlToMap(
          type,
          kmlContent,
          file.name,
          map,
          ortho,
          featureID,
          false,
          setEditOptions,
          source,
          addStaticAnnotation,
          setAnnotationFuntion
        );
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }
  }
}
