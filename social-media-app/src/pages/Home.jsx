// Home.jsx
import React, { useEffect, useState, useRef } from "react";
import CommentTable from "../components/CommentTable";
import CommentsPage from "../components/CommentsPage";
import CreateCommentModal from "../components/CreateCommentModal";
import { authFetch } from "../authFetch";

const PAGE_SIZE = 25;

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Ошибка парсинга user:", e);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const isUserAuthenticated = !!user;
  const currentUser = isUserAuthenticated
    ? { username: user.username, email: user.email }
    : {};

  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1); // последняя загруженная страница
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortField, setSortField] = useState("created");
  const [sortOrder, setSortOrder] = useState("desc");

  const [selectedComment, setSelectedComment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const loaderRef = useRef(null);

  const fetchComments = (pageToLoad = 1, append = false) => {
    setLoading(true);
    setError(null);

    authFetch(
      `/api/comments/?page=${pageToLoad}&sort_by=${sortField}&order=${sortOrder}`,
      { method: "GET" }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        const mapped = (data.results || []).map((c) => ({
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
        }));

        setComments((prev) => (append ? [...prev, ...mapped] : mapped));

        const totalCount = data.count || 0;
        setTotal(totalCount);

        const maxPage = Math.ceil(totalCount / PAGE_SIZE);
        setHasMore(mapped.length > 0 && pageToLoad < maxPage);

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Ошибка загрузки");
        setLoading(false);
      });
  };

  useEffect(() => {
    setPage(1);
    fetchComments(1, false);
  }, [sortField, sortOrder]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchComments(nextPage, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px 200px 0px", 
      }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [loaderRef, hasMore, loading, page]); 
    
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

          if (sortField === "created" && sortOrder === "desc") {
            setComments((prev) => [mapped, ...prev]);
          }

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
  }, [sortField, sortOrder]);


  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleCommentCreated = () => {
    setIsModalOpen(false);
    setSortField("created");
    setSortOrder("desc");
    setPage(1);
    fetchComments(1, false);
  };

  return (
    <div className="comments-container">
      {error && <p style={{ color: "red" }}>Ошибка: {error}</p>}

      {selectedComment ? (
        <CommentsPage
          commentId={selectedComment}
          onBack={() => setSelectedComment(null)}
        />
      ) : (
        <>
          <CommentTable
            comments={comments}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
            onSelect={setSelectedComment}
            onAddComment={() => setIsModalOpen(true)}
          />

          {/* маяк для автоподгрузки */}
          {hasMore && <div ref={loaderRef} style={{ height: "40px" }} />}

          {loading && <p>Загрузка...</p>}
        </>
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
