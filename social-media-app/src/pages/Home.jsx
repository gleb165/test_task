import React, { useEffect, useState } from "react";
import CommentTable from "../components/CommentTable";
import CommentsPage from "../components/CommentsPage";
import CreateCommentModal from "../components/CreateCommentModal";
import { authFetch } from "../authFetch";

function Home() {
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortField, setSortField] = useState("created");
  const [sortOrder, setSortOrder] = useState("desc");

  const [selectedComment, setSelectedComment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ===== LOAD USER =====
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

  // ===== FETCH COMMENTS ONCE =====
  const fetchComments = () => {
    setLoading(true);
    setError(null);

    authFetch(`/api/comments/?sort_by=${sortField}&order=${sortOrder}`)
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

        setComments(mapped);
      })
      .catch((err) => {
        setError(err.message || "Ошибка загрузки");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ===== LOAD ON SORT CHANGE =====
  useEffect(() => {
    fetchComments();
  }, [sortField, sortOrder]);

  // ===== REALTIME COMMENTS THROUGH WS =====
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

          // prepend only if sorted by newest
          if (sortField === "created" && sortOrder === "desc") {
            setComments((prev) => [mapped, ...prev]);
          }
        }
      } catch (e) {
        console.error("Ошибка парсинга WS:", e);
      }
    };

    return () => socket.close();
  }, [sortField, sortOrder]);

  // ===== SORT HANDLER =====
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // ===== AFTER CREATE =====
  const handleCommentCreated = () => {
    setIsModalOpen(false);
    setSortField("created");
    setSortOrder("desc");
    fetchComments();
  };

  // ===== RENDER =====
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
