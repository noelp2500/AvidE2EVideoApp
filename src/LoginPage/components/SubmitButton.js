import React from "react";

const SubmitButton = ({ handleSubmitButtonPressed }) => {
  return (
    <div className="login-page_button_container">
      <button
        className="login-page_button background_submit_button_box text_main_color"
        onClick={handleSubmitButtonPressed}
      >
        Start using AvidE2E
      </button>
    </div>
  );
};

export default SubmitButton;
