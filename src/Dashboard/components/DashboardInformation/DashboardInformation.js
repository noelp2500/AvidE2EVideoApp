import React from "react";

import "./DashboardInformation.css";

const DashboardInformation = ({ username }) => {
  return (
    <div className="dashboard_info_text_container">
      <span className="dashboard_info_text_title">Hello {username},</span>
      <span className="dashboard_info_text_title">
        Welcome to AvidE2E By Noel Pereira.
      </span>
      <span className="dashboard_info_text_description">
        You can place a call by either selecting the user on the right hand tab,
        or by creating a group call.
      </span>
      <span className="dashboard_info_text_description">HAPPY CALLING!</span>
    </div>
  );
};

export default DashboardInformation;
