import React from "react";
import Driver, { driver } from "driver.js"; // Sửa lại import
import "driver.js/dist/driver.min.css";

export default function DriverTutorial() {
  const startTour = () => {
    const tour = driver({
      showProgress: true,
      overlayOpacity: 0.5,
      doneBtnText: "Kết thúc",
      nextBtnText: "Tiếp theo",
      prevBtnText: "Quay lại",
    });

    tour.highlight({
      element: "#notification-btn",
      popover: {
        title: "Thông báo",
        description: "Nhấn vào đây để xem thông báo của bạn.",
        side: "bottom",
        align: "start",
      },
    });

    tour.drive(); // Bắt đầu hướng dẫn
  };

  return (
    <button onClick={startTour} style={{ padding: "10px", background: "#0077b6", color: "#fff" }}>
      Hướng dẫn sử dụng
    </button>
  );
}
