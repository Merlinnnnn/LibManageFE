import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const startTour = () => {
  // Kiểm tra xem người dùng đã xem tutorial chưa
  console.log("startTour");
  //const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
  
  // Lấy đường dẫn hiện tại
  const currentPath = window.location.pathname;
  
  // Nếu chưa xem tutorial
  if (true) {
    // Kiểm tra đường dẫn và chạy tour tương ứng
    if (currentPath === '/home') {
      const infoString = localStorage.getItem('info');
      if (infoString) {
        startHomeTourLoggedIn();
      } else {
        startHomeTour();
      }
    } else if (currentPath === '/bookshelf') {
      startBookShelfTour();
    }
    
    // Đánh dấu đã xem tutorial
    localStorage.setItem('hasSeenTutorial', 'true');
  }
};

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
        element: '#logout', 
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

export const startBookShelfTour = () => {
  const driverObj = driver({
    showProgress: true,
    steps: [
      { 
        element: '#search-box', 
        popover: { 
          title: 'Tìm kiếm sách', 
          description: 'Nhập tên sách, tác giả hoặc môn học để tìm kiếm sách trong thư viện.', 
          side: "bottom", 
          align: 'center' 
        } 
      },
      { 
        element: '#recommended-books', 
        popover: { 
          title: 'Sách đề xuất', 
          description: 'Những cuốn sách được đề xuất dựa trên sở thích và lịch sử đọc của bạn.', 
          side: "bottom", 
          align: 'center' 
        } 
      },
      { 
        element: '#filter-section', 
        popover: { 
          title: 'Bộ lọc tìm kiếm', 
          description: 'Lọc sách theo loại tài liệu và môn học để tìm kiếm chính xác hơn.', 
          side: "right", 
          align: 'center' 
        } 
      },
      { 
        element: '#book-list', 
        popover: { 
          title: 'Danh sách sách', 
          description: 'Xem danh sách các sách có trong thư viện. Nhấn vào "Xem chi tiết" để biết thêm thông tin về sách.', 
          side: "left", 
          align: 'center' 
        } 
      },
      { 
        element: '#pagination', 
        popover: { 
          title: 'Phân trang', 
          description: 'Chuyển trang để xem thêm sách.', 
          side: "top", 
          align: 'center' 
        } 
      }
    ]
  });
  driverObj.drive();
};

export default startTour; 