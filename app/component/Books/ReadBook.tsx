"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import apiService from "../../untils/api";

interface GenericApiResponse<T> {
  code: number;
  result: T;
  message?: string;
}

interface StartSessionResponse {
  sessionId: string;
  currentPage: number;
}

const ReadBook: React.FC = () => {
  const [id, setId] = useState<string | null>(null);

  const [pages, setPages] = useState<{ [key: number]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // ✅ Lấy documentId từ URL (chạy ở client)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setId(searchParams.get("id"));
    }
  }, []);

  // ✅ Bắt đầu session khi có id
  useEffect(() => {
    if (id) {
      startSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ Gọi API bắt đầu session
  const startSession = async () => {
    try {
      const response = await apiService.post<
        GenericApiResponse<StartSessionResponse>
      >("/api/v1/reading-sessions/start", { documentId: id });

      if (response.status === 200 && response.data.result) {
        const { sessionId, currentPage } = response.data.result;
        setSessionId(sessionId);
        setCurrentPage(currentPage);

        // Tải từ trang 1 đến trang hiện tại
        for (let page = 1; page <= currentPage; page++) {
          await loadPage(page);
        }

        // ✅ Cuộn xuống đúng trang
        setTimeout(() => {
          if (
            typeof window !== "undefined" &&
            document.getElementById(`page-${currentPage}`)
          ) {
            window.scrollTo({
              top: document.getElementById(`page-${currentPage}`)!.offsetTop,
              behavior: "smooth",
            });
          }
        }, 500);
      }
    } catch (error) {
      console.log("Error starting session:", error);
    }
  };

  // ✅ Load page API
  const loadPage = async (page: number) => {
    if (loading || pages[page] || isEnd) return;

    setLoading(true);
    try {
      const response = await apiService.get<GenericApiResponse<string>>(
        `/api/v1/documents/${id}/read`,
        { params: { page } }
      );

      if (response.status === 200 && response.data.result) {
        const base64Data = response.data.result;
        setPages((prev) => ({
          ...prev,
          [page]: base64Data,
        }));
      } else {
        setHasMorePages(false);
        setIsEnd(true);
      }
    } catch (error) {
      console.log("Error loading page:", error);
      setHasMorePages(false);
      setIsEnd(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cập nhật currentPage mỗi phút
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(() => {
      updateCurrentPage(currentPage);
    }, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sessionId]);

  const updateCurrentPage = async (currentPage: number) => {
    try {
      await apiService.put(
        `/api/v1/reading-sessions/${sessionId}?currentPage=${currentPage}`
      );
    } catch (error) {
      console.log("Error updating current page:", error);
    }
  };

  // ✅ Scroll để tải thêm trang
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;

      const scrollPosition =
        window.innerHeight + document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.offsetHeight;

      if (
        scrollPosition / scrollHeight > 0.9 &&
        !loading &&
        !isEnd &&
        hasMorePages
      ) {
        setCurrentPage((prev) => prev + 1);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [loading, isEnd, hasMorePages]);

  // ✅ Load trang khi currentPage thay đổi
  useEffect(() => {
    if (id && !isEnd && hasMorePages && !loading) {
      loadPage(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // ✅ Bookmark trang
  const handleBookmark = async () => {
    if (!sessionId) return;
    try {
      const response = await apiService.put(
        `/api/v1/reading-sessions/${sessionId}?currentPage=${currentPage}`
      );
      if (response.status === 200) {
        alert("Đã đánh dấu trang!");
      }
    } catch (error) {
      console.log("Error bookmarking page:", error);
    }
  };

  return (
    <Box sx={{ padding: "20px" }}>
      {/* Nút bookmark */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
        }}
      >
        <IconButton onClick={handleBookmark}>
          <BookmarkAddIcon />
        </IconButton>
      </Box>

      {/* Trang sách */}
      {Object.keys(pages).length === 0 && (
        <Typography>Loading book...</Typography>
      )}
      {Object.keys(pages).map((key) => {
        const page = parseInt(key, 10);
        const base64 = pages[page];

        return (
          <Box
            key={page}
            id={`page-${page}`}
            sx={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {base64 ? (
              <img
                src={`data:image/png;base64,${base64}`}
                alt={`Page ${page}`}
                style={{
                  width: "80%",
                  objectFit: "contain",
                  alignItems: "center",
                }}
              />
            ) : (
              <Typography>End of book reached</Typography>
            )}
          </Box>
        );
      })}
      {isEnd && (
        <Typography sx={{ textAlign: "center", marginTop: "20px" }}>
          End of book reached
        </Typography>
      )}
    </Box>
  );
};

export default ReadBook;
