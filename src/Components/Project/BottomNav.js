import React from "react";

const BottomNav = () => {
  return (
    <div className="bottomnav">
      <div className="select-wrapper">
        <select id="unitConversion" className="custom-select">
          <option value="meters">Meters (m)</option>
          <option value="kilometers">Kilometers (km)</option>
          <option value="feet">Feet (ft)</option>
          <option value="miles">Miles (mi)</option>
          <option value="acres">Acres</option>
          <option value="hectares">Hectares</option>
        </select>
      </div>
      <div className="flex gap-2" style={{ marginRight: "18%" }}>
        <p id="lat-long"></p>
        <p></p>
        <p id="lat-long-click"></p>
      </div>
      <div></div>
    </div>
  );
};

export default BottomNav;
