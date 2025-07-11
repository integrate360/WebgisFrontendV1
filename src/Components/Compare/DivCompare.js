import React, { useEffect, useRef, useState } from "react";
import "../../styles/DivCompare.css"; // Assuming you move the CSS here

function DivCompare({ left, right }) {
  const imgRef = useRef(null);
  const overlayRef = useRef(null);
  const sliderRef = useRef(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    function initComparisons() {
      var x, i;
      /*find all elements with an "overlay" class:*/
      x = document.getElementsByClassName("img-comp-overlay");
      for (i = 0; i < x.length; i++) {
        /*once for each "overlay" element:
    pass the "overlay" element as a parameter when executing the compareImages function:*/
        compareImages(x[i]);
      }
      function compareImages(img) {
        var slider,
          img,
          clicked = 0,
          w,
          h;
        /*get the width and height of the img element*/
        w = img.offsetWidth;
        h = img.offsetHeight;
        /*set the width of the img element to 50%:*/
        img.style.width = w / 2 + "px";
        /*create slider:*/
        slider = document.createElement("DIV");
        slider.setAttribute("class", "img-comp-slider");
        const sliderButton = document.createElement("DIV");
        sliderButton.setAttribute("class", "slider-button");
        sliderButton.innerHTML = `        <div
        class="slider-icon"
        >
        <i class="fas fa-chevron-left"></i>
        <i class="fas fa-chevron-right"></i>
        </div>`;
        const num2 = document.createElement("DIV");
        num2.setAttribute("class", "a-compare-number");
        num2.innerHTML = "2";
        slider.appendChild(num2);
        slider.appendChild(sliderButton);
        /*insert slider*/
        img.parentElement.insertBefore(slider, img);
        /*position the slider in the middle:*/
        slider.style.top = h / 2 - slider.offsetHeight / 2 + "px";
        slider.style.left = w / 2 - slider.offsetWidth / 2 + "px";
        /*execute a function when the mouse button is pressed:*/
        slider.addEventListener("mousedown", slideReady);
        /*and another function when the mouse button is released:*/
        window.addEventListener("mouseup", slideFinish);
        /*or touched (for touch screens:*/
        slider.addEventListener("touchstart", slideReady);
        /*and released (for touch screens:*/
        window.addEventListener("touchend", slideFinish);
        function slideReady(e) {
          /*prevent any other actions that may occur when moving over the image:*/
          e.preventDefault();
          /*the slider is now clicked and ready to move:*/
          clicked = 1;
          /*execute a function when the slider is moved:*/
          window.addEventListener("mousemove", slideMove);
          window.addEventListener("touchmove", slideMove);
        }
        function slideFinish() {
          /*the slider is no longer clicked:*/
          clicked = 0;
        }
        function slideMove(e) {
          var pos;
          /*if the slider is no longer clicked, exit this function:*/
          if (clicked == 0) return false;
          /*get the cursor's x position:*/
          pos = getCursorPos(e);
          /*prevent the slider from being positioned outside the image:*/
          if (pos < 0) pos = 0;
          if (pos > w) pos = w;
          /*execute a function that will resize the overlay image according to the cursor:*/
          slide(pos);
        }
        function getCursorPos(e) {
          var a,
            x = 0;
          e = e.changedTouches ? e.changedTouches[0] : e;
          /*get the x positions of the image:*/
          a = img.getBoundingClientRect();
          /*calculate the cursor's x coordinate, relative to the image:*/
          x = e.pageX - a.left;
          /*consider any page scrolling:*/
          x = x - window.pageXOffset;
          return x;
        }
        function slide(x) {
          /*resize the image:*/
          img.style.width = x + "px";
          /*position the slider:*/
          slider.style.left = img.offsetWidth - slider.offsetWidth / 2 + "px";
        }
      }
    }
    initComparisons();
  }, []);

  const slideReady = (e) => {
    e.preventDefault();
    setClicked(true);
    window.addEventListener("mousemove", slideMove);
    window.addEventListener("touchmove", slideMove);
  };

  const slideFinish = () => {
    setClicked(false);
  };

  const slideMove = (e) => {
    if (!clicked) return;
    const pos = getCursorPos(e);
    if (pos < 0) return;
    if (pos > imgRef.current.offsetWidth) return;
    slide(pos);
  };

  const getCursorPos = (e) => {
    const a = imgRef.current.getBoundingClientRect();
    const x = e.changedTouches
      ? e.changedTouches[0].pageX - a.left
      : e.pageX - a.left;
    return x - window.pageXOffset;
  };

  const slide = (x) => {
    overlayRef.current.style.width = x + "px";
    sliderRef.current.style.left =
      overlayRef.current.offsetWidth - sliderRef.current.offsetWidth / 2 + "px";
  };

  return (
    <div className="img-comp-container">
      <div ref={imgRef} className="img-comp-img">
        <div className="compare-item">{left}</div>
      </div>
      <div ref={overlayRef} className="img-comp-img img-comp-overlay">
        <div className="compare-item2">{right}</div>
      </div>
    </div>
  );
}

export default DivCompare;
