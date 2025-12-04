import React, { useEffect, useState } from "react";
import "./Comment.css";
import CreateCommentModal from "./CreateCommentModal";

const Comment = ({ comment, onLike, onDislike }) => {
  const [user, setUser] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

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

  const isUserAuthenticated = !!user;
  const currentUser = isUserAuthenticated
    ? { username: user.username, email: user.email }
    : {};

  return (
    <div className="comment-wrapper">
      {/* COMMENT CARD */}
      <div className="comment-card">
        {/* HEADER */}
        <div className="comment-header">
          <img
            className="avatar"
            src={comment.avatar || "/default-avatar.png"}
            alt="avatar"
          />
          <div className="comment-meta">
            <span className="username">{comment.username || "Anon"}</span>
            <span className="timestamp">
              {new Date(comment.created).toLocaleString("ru-RU", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>

        {/* BODY */}
        <div className="comment-body">
          <p>{comment.text}</p>

          {comment.attachments?.length > 0 && (
            <div className="attachments">
              {comment.attachments.map((att) => {
                if (att.attachment_type === "image") {
                  return (
                    <img
                      key={att.id}
                      src={att.file}
                      alt="Вложение-изображение"
                      onClick={() => setLightboxImg(att.file)}
                    />
                  );
                } else if (att.attachment_type === "text") {
                  return (
                    <div key={att.id} className="attachment-text">
                      <p>📄 Файл: {att.filename || "Текстовый файл"}</p>
                      <a
                        href={att.file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Открыть/Скачать
                      </a>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="comment-footer">
          <button
            className="reply-btn"
            onClick={() => setReplyModalOpen(true)}
          >
            Ответить
          </button>

          <div className="like-block">
            <button
              className={`like-btn ${
                comment.liked === true ? "active-like" : ""
              }`}
              onClick={() => onLike && onLike(comment.id)}
            >
              ▲
            </button>

            <span>{comment.likes}</span>

            <button
              className={`dislike-btn ${
                comment.liked === false ? "active-dislike" : ""
              }`}
              onClick={() => onDislike && onDislike(comment.id)}
            >
              ▼
            </button>
          </div>
        </div>
      </div>

      {/* REPLIES */}
      {comment.replies?.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((rep) => (
            <Comment
              key={rep.id}
              comment={rep}
              // вот это было нужно добавить:
              onLike={onLike}
              onDislike={onDislike}
            />
          ))}
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxImg && (
        <div
          className="lightbox-backdrop"
          onClick={() => setLightboxImg(null)}
        >
          <img src={lightboxImg} className="lightbox-image" alt="" />
        </div>
      )}

      {/* MODAL */}
      {replyModalOpen && (
        <CreateCommentModal
          isAuth={isUserAuthenticated}
          user={currentUser}
          parentId={comment.id}
          onClose={() => setReplyModalOpen(false)}
          onCommentCreated={() => setReplyModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Comment;
