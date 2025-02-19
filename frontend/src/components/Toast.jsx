import React from "react";

export default function Toast({ toastMsg, toastType }) {
  if (!toastMsg) return null;

  // We can map toastType to Bootstrap classes or switch on different styles
  const alertClass =
    toastType === "danger" ? "alert-danger" : "alert-success";

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        left: "1rem",
        minWidth: "200px",
        zIndex: 9999,
      }}
    >
      <div className={`alert ${alertClass} mb-0`} role="alert">
        {toastMsg}
      </div>
    </div>
  );
}
