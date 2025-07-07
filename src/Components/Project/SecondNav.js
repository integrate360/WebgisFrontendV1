import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useContext,
  useRef,
} from "react";
import axios from "axios";
import moment from "moment"; // Assuming you're using moment.js for date formatting
import {
  dateDiffInDays,
  getAnnotationToOrtho,
  sortDatesAscending,
  ymdFormat,
} from "../../utils/Functions";
import { AnnotationsContext } from "../../context/Annotations";
import { useOrthoContext } from "../../context/OrthoContext";
import { useMap } from "../../context/Map";
import { api } from "../../config";
import { updateGeoTIFFLayer } from "../../utils/map";
import { Link, useNavigate, useParams } from "react-router-dom";
import orthoMockImage from "../../assets/location.png";
import { useEditOptions } from "../../context/editOptionsDetails";
const SecondNav = ({ dates }) => {
  const [list, setList] = useState([]);
  const { setEditOptions, editOptions } = useEditOptions();

  const [selectedItem, setSelectedItem] = useState(null);
  const [sortedDates, setSortedDates] = useState([]);
  const { ortho, setProjectDate, projectDate } = useOrthoContext();
  const [width, setWidth] = useState(5);
  const params = useParams();
  const [scale, setScale] = useState(2);
  const { updateAnnotation, annotations, staticAnnotations } =
    useContext(AnnotationsContext);
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [curr, setCurr] = useState(false);
  const { map, source } = useMap();
  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      if (dates) setSortedDates(sortDatesAscending(dates));
      else setSortedDates([]);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [dates]);

  const today = new Date();
  const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1));

  const formattedDates = useMemo(() => ymdFormat(sortedDates), [sortedDates]);
  const differenceInDays = useMemo(() => {
    return sortedDates.length > 0
      ? dateDiffInDays(sortedDates[0], new Date())
      : 0;
  }, [sortedDates]);

  const handleItemClick = (listItem, sDate) => {
    setSelectedItem(listItem);
    if (ortho.length <= 0) return;
    source.clear();
    // for (let id of staticAnnotations) {
    //   const element = document.querySelector(`[staticId=${id}]`);
    //   if (element) element.remove();
    // }
    map
      ?.getLayers()
      ?.getArray()
      ?.forEach((layer) => {
        if (!["mapLayer", "mapTiler"].includes(layer.get("id"))) {
          map.removeLayer(layer);
        }
      });

    // find the right ortho
    ortho.map(async (e) => {
      // if click the slected list item then it should return saving the fetch request
      if (moment(e.date).format("YYYY-MM-DD") != sDate) return;
      if (localStorage.getItem("orthoId") == e._id) return;
      navigate(`/project/${params.id}/${e._id}`);
      setProjectDate(moment(e?.date).format("YYYY-MM-DD"));
    });
    window.location.reload();
  };

  const daysArray = Array.from(
    { length: differenceInDays + 1 },
    (_, index) => differenceInDays - index
  );

  // wheel scroll in1 and scroll out functionality
  const weelHandler = (event) => {
    const delta = Math.sign(event.deltaY);
    const reversedDelta = -delta; // Invert the direction of scroll
    const newScale = scale + reversedDelta;
    const newSCale2 = Math.max(0.1, Math.min(newScale, 500)); // Adjust the maximum scale as needed
    setScale(newSCale2);
    setWidth(newSCale2);
  };

  const handleMouseDown = (e) => {
    const element = scrollRef.current;
    setIsDragging(true);
    setStartX(e.pageX - element.offsetLeft);
    setScrollLeft(element.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent default behavior to avoid text selection or other issues
    const element = scrollRef.current;
    const x = e.pageX - element.offsetLeft;
    const walk = (x - startX) * 1.5; // Adjust the multiplier for speed
    element.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [sortedDates]);
  useEffect(() => {
    const isCurrentDatePresent = daysArray.some((d) => {
      const currentDate = moment(
        new Date(Date.now() - d * 24 * 60 * 60 * 1000)
      ).format("YYYY-MM-DD");
      return currentDate === projectDate;
    });
    setCurr(isCurrentDatePresent);
  }, [projectDate, daysArray]);

  const getImageByDate = (date) => {
    const image = [];
    ortho.map(async (e) => {
      // if click the slected list item then it should return saving the fetch request
      if (moment(e.date).format("YYYY-MM-DD") != date) return;
      if (e?.images?.length <= 0) return;
      return image.push(e?.images[0]);
    });
    return image[0] ?? orthoMockImage;
  };
  return (
    <div className="secondnav" id="secondnav" onWheel={weelHandler}>
      <div
        className="layer-list"
        id="layer-list"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {daysArray.map((d) => {
          const currentDate = moment(
            new Date(Date.now() - d * 24 * 60 * 60 * 1000)
          ).format("YYYY-MM-DD");

          const isDateInList = formattedDates.includes(currentDate);
          const isLastDate =
            formattedDates[formattedDates.length - 1] === currentDate;
          const isIteminLastArrayAndselectNull =
            isLastDate && selectedItem == null && !curr;
          return isDateInList ? (
            <div
              key={d}
              className={`layer-list-date-div ${
                selectedItem == d
                  ? "selected-item"
                  : currentDate == projectDate
                  ? "selected-item"
                  : isIteminLastArrayAndselectNull
                  ? "selected-item"
                  : ""
              }`}
              id={`layer-list-date-id=${d}`}
              onClick={() => {
                handleItemClick(d, currentDate);
              }}
            >
              <div className="layer-list-item-filled">
                <div className="filled-div">
                  <div
                    className="filled-div-thumbnail"
                    style={{ height: "100%", width: "100%" }}
                  ></div>
                  {/* <img
                    style={{
                      width: "100%",
                      height: "40px",
                      borderRadius: "4px 4px 0 0",
                      objectFit: "contain",
                    }}
                    alt="image"
                    src={getImageByDate(currentDate)}
                  /> */}
                  <div className="filled-div-date">
                    <p>{currentDate}</p>
                  </div>
                </div>
              </div>
              <div className="stand"></div>
              <div className="circle"></div>
            </div>
          ) : (
            <div
              key={d} // Add key for proper list rendering
              className="layer-list-item"
              style={{
                width: `${width}px`,
                color: "black",
                minWidth: `${width}px`,
              }}
            />
          );
        })}
      </div>
      <hr className="secondNav-hr" />
      <div className="bottom-black"></div>
      <div className="second-nav-compare">
        <Link
          to={`/compare/${params.id}/${ortho[0]?._id}/${
            ortho[ortho.length - 1]?._id
          }`}
          className="second-nav-dompare-button"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fit=""
            preserveAspectRatio="xMidYMid meet"
            focusable="false"
            style={{ width: "26px", height: "26px", marginRight: "3px" }}
          >
            <path
              d="m20 4.01-5-.003V6h5v12h-5v2h5a2.006 2.006 0 0 0 2-2V6a1.997 1.997 0 0 0-2-1.99Z"
              fill="#ffffff"
            ></path>
            <path
              d="m4 18 5-7V4.003L4 4a2.006 2.006 0 0 0-2 2v12a2.006 2.006 0 0 0 2 2h5v-2H4Z"
              fill="#ffffff"
            ></path>
            <path d="M13 21h-2v2h2v-2Z" fill="#ffffff"></path>
            <path d="M13 20h-2v1h2v-1Z" fill="#ffffff"></path>
            <path d="M13 2h-2v2.005h2V2Z" fill="#ffffff"></path>
            <path d="M13 4.005h-2V20h2V4.005Z" fill="#ffffff"></path>
            <path d="M15 18h5l-5-7v7Z" fill="#ffffff"></path>
          </svg>
          Compare
        </Link>
      </div>
    </div>
  );
};

export default SecondNav;
