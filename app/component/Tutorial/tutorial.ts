import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startHomeTour = () => {
  const driverObj = driver({
    showProgress: true,
    steps: [
      { 
        element: '#sign-up-btn', 
        popover: { 
          title: 'Đăng ký tài khoản', 
          description: 'Nhấn vào đây để tạo tài khoản mới và bắt đầu sử dụng thư viện.', 
          side: "left", 
          align: 'start' 
        } 
      },
      { 
        element: '#sign-in-btn', 
        popover: { 
          title: 'Đăng nhập', 
          description: 'Đã có tài khoản? Nhấn vào đây để đăng nhập vào hệ thống.', 
          side: "left", 
          align: 'start' 
        } 
      },
      { 
        element: '#get-book', 
        popover: { 
          title: 'Kệ sách', 
          description: 'Khám phá kho sách phong phú của chúng tôi.', 
          side: "left", 
          align: 'start' 
        } 
      },
      { 
        element: '#book-list', 
        popover: { 
          title: 'Sách đề xuất', 
          description: 'Những cuốn sách được đề xuất dựa trên sở thích của bạn.', 
          side: "left", 
          align: 'start' 
        } 
      },
      { 
        popover: { 
          title: 'Bắt đầu khám phá', 
          description: 'Bạn đã sẵn sàng để bắt đầu hành trình đọc sách của mình!' 
        } 
      }
    ]
  });
  driverObj.drive();
};
export const startHomeTourLoggedIn = () => {
  const driverObj = driver({
    showProgress: true,
    steps: [
      { 
        element: '#user-info', 
        popover: { 
          title: 'Thông tin người dùng', 
          description: 'Nhấn vào đây để xem các thông tin người dùng như sách yêu thích, lịch sử mượn hoặc thông tin cá nhân', 
          side: "left", 
          align: 'start' 
        } 
      },
      { 
        element: '#info', 
        popover: { 
          title: 'Thông tin cá nhân', 
          description: 'Chọn vào đây để xem thông tin cá nhân của bạn', 
          side: "left", 
          align: 'start' 
        } 
      },
      { 
        element: '#virtual-book', 
        popover: { 
          title: 'Kệ sách ảo', 
          description: 'Xem danh sách sách ảo của người dùng đăng và danh sách sách yêu thích', 
          side: "left", 
          align: 'start' 
        } 
      },
      { 
        element: '#book-list', 
        popover: { 
          title: 'Đăng xuất', 
          description: 'Ấn vào để đăng xuất tài khoản', 
          side: "left", 
          align: 'start' 
        } 
      },
      { 
        popover: { 
          title: 'Kết thúc', 
          description: 'Bạn đã sẵn sàng để bắt đầu hành trình đọc sách của mình!' 
        } 
      }
    ]
  });
  driverObj.drive();
};

export const startReadingTour = () => {
  const driverObj = driver({
    showProgress: true,
    steps: [
      { 
        element: '#book-controls', 
        popover: { 
          title: 'Điều khiển đọc sách', 
          description: 'Sử dụng các nút điều khiển để chuyển trang, điều chỉnh font chữ và các tùy chọn khác.', 
          side: "bottom", 
          align: 'center' 
        } 
      },
      { 
        element: '#bookmark-btn', 
        popover: { 
          title: 'Đánh dấu trang', 
          description: 'Lưu lại vị trí đang đọc để tiếp tục sau này.', 
          side: "left", 
          align: 'center' 
        } 
      },
      { 
        element: '#note-btn', 
        popover: { 
          title: 'Ghi chú', 
          description: 'Thêm ghi chú cho đoạn văn bản bạn đang đọc.', 
          side: "right", 
          align: 'center' 
        } 
      },
      { 
        element: '#search-text', 
        popover: { 
          title: 'Tìm kiếm trong sách', 
          description: 'Tìm kiếm từ khóa trong nội dung sách.', 
          side: "top", 
          align: 'center' 
        } 
      }
    ]
  });
  driverObj.drive();
};

export const startBorrowedBooksTour = () => {
  const driverObj = driver({
    showProgress: true,
    steps: [
      { 
        element: '#borrowed-list', 
        popover: { 
          title: 'Danh sách sách đã mượn', 
          description: 'Xem danh sách các sách bạn đã mượn và thời hạn trả.', 
          side: "bottom", 
          align: 'start' 
        } 
      },
      { 
        element: '#return-btn', 
        popover: { 
          title: 'Trả sách', 
          description: 'Nhấn vào đây để trả sách khi đã đọc xong.', 
          side: "left", 
          align: 'center' 
        } 
      },
      { 
        element: '#renew-btn', 
        popover: { 
          title: 'Gia hạn mượn', 
          description: 'Gia hạn thời gian mượn sách nếu cần thêm thời gian.', 
          side: "right", 
          align: 'center' 
        } 
      }
    ]
  });
  driverObj.drive();
};

export const startProfileTour = () => {
  const driverObj = driver({
    showProgress: true,
    steps: [
      { 
        element: '#profile-avatar', 
        popover: { 
          title: 'Ảnh đại diện', 
          description: 'Nhấn vào đây để thay đổi ảnh đại diện của bạn.', 
          side: "right", 
          align: 'center' 
        } 
      },
      { 
        element: '#edit-profile', 
        popover: { 
          title: 'Chỉnh sửa thông tin', 
          description: 'Cập nhật thông tin cá nhân của bạn.', 
          side: "left", 
          align: 'center' 
        } 
      },
      { 
        element: '#borrow-history', 
        popover: { 
          title: 'Lịch sử mượn sách', 
          description: 'Xem lại lịch sử mượn sách của bạn.', 
          side: "bottom", 
          align: 'start' 
        } 
      }
    ]
  });
  driverObj.drive();
}; 