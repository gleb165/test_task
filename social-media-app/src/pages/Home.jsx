// Home.jsx
import React, { useEffect, useState } from "react";
import CommentTable from "../components/CommentTable";
import CommentsPage from "../components/CommentsPage";
import CreateCommentModal from "../components/CreateCommentModal";
import { authFetch } from "../authFetch";

const PAGE_SIZE = 25;

function Home() {
  // --- авторизация через localStorage ---
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Ошибка парсинга данных пользователя из localStorage:", e);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const isUserAuthenticated = user !== null;
  const currentUser = isUserAuthenticated
    ? { username: user.username, email: user.email }
    : {};

  // --- состояние списка комментариев ---
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("created");
  const [sortOrder, setSortOrder] = useState("desc");
  const [total, setTotal] = useState(0);

  const [selectedComment, setSelectedComment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- загрузка списка комментариев через REST ---
  const fetchComments = () => {
    setLoading(true);
    setError(null);

    authFetch(
      `/api/comments/?page=${page}&sort_by=${sortField}&order=${sortOrder}`,
      {
        method: "GET",
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        const mappedComments = (data.results || []).map((comment) => ({
          id: comment.id,
          username: comment.author_name || comment.guest_name,
          email: comment.author_email || comment.guest_email,
          avatar: comment.author?.avatar || "/default-avatar.png",
          timestamp: new Date(comment.created).toLocaleString("ru-RU", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          created: comment.created,
          text: comment.text,
          likes: comment.likes_count,
          liked: comment.liked,
          attachments: comment.attachments,
          replies: comment.replies || [],
        }));

        setComments(mappedComments);
        setTotal(data.count || 0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Ошибка загрузки");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortField, sortOrder]);

  // --- realtime: WebSocket для новых корневых комментариев ---
  useEffect(() => {
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsScheme}://${window.location.host}/ws/comments/`;

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "comment_created") {
          const c = data.comment;

          const mapped = {
            id: c.id,
            username: c.author_name || c.guest_name,
            email: c.author_email || c.guest_email,
            avatar: c.author?.avatar || "/default-avatar.png",
            timestamp: new Date(c.created).toLocaleString("ru-RU", {
              dateStyle: "medium",
              timeStyle: "short",
            }),
            created: c.created,
            text: c.text,
            likes: c.likes_count,
            liked: c.liked,
            attachments: c.attachments,
            replies: c.replies || [],
          };

          // Добавляем новый коммент в начало только если
          // мы на 1 странице и сортировка по дате сверху-вниз
          setComments((prev) => {
            if (
              page !== 1 ||
              sortField !== "created" ||
              sortOrder !== "desc"
            ) {
              return prev;
            }

            const next = [mapped, ...prev];

            // поддерживаем размер страницы
            if (next.length > PAGE_SIZE) {
              return next.slice(0, PAGE_SIZE);
            }
            return next;
          });

          setTotal((prev) => prev + 1);
        }
      } catch (e) {
        console.error("Ошибка парсинга WS-сообщения:", e);
      }
    };

    socket.onerror = (e) => {
      console.error("Ошибка WebSocket:", e);
    };

    return () => {
      socket.close();
    };
  }, [page, sortField, sortOrder]);

  // --- сортировка таблицы ---
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  // Коллбек после создания нового комментария из модалки
  const handleCommentCreated = () => {
    setIsModalOpen(false);
    setPage(1);
    setSortField("created");
    setSortOrder("desc");
    // REST подхватит, плюс WebSocket для новых
    fetchComments();
  };

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="comments-container">
      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: "red" }}>Ошибка: {error}</p>}

      {selectedComment ? (
        <CommentsPage
          commentId={selectedComment}
          onBack={() => setSelectedComment(null)}
        />
      ) : (
        <CommentTable
          comments={comments}
          onPageChange={setPage}
          page={page}
          pageCount={pageCount}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
          onSelect={setSelectedComment}
          onAddComment={() => setIsModalOpen(true)}
        />
      )}

      {isModalOpen && (
        <CreateCommentModal
          isAuth={isUserAuthenticated}
          user={currentUser}
          onClose={() => setIsModalOpen(false)}
          onCommentCreated={handleCommentCreated}
        />
      )}
    </div>
  );
}

export default Home;
