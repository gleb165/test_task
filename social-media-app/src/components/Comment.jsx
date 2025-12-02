import React, { useState } from "react";
import "./Comment.css";

const Comment = ({ comment }) => {
  const [lightboxImg, setLightboxImg] = useState(null);

  return (
    <div className="comment-wrapper">
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

          <div className="comment-icons">
            <span>🔗</span>
            <span>💬</span>
            <span>⏱</span>
          </div>
        </div>

        {/* BODY */}
        <div className="comment-body">
          <p>{comment.text}</p>

          {comment.attachments?.length > 0 && (
            <div className="attachments">
              {comment.attachments.map(att => {
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
                  // 💡 ДОБАВЛЕНИЕ ДЛЯ ТЕКСТОВОГО ВЛОЖЕНИЯ
                  return (
                    <div key={att.id} className="attachment-text">
                      <p>📄 Файл: {att.filename || 'Текстовый файл'}</p>
                      <a href={att.file} target="_blank" rel="noopener noreferrer">
                         (Открыть/Скачать)
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
          <button className="reply-btn">Ответить</button>

          <div className="like-block">
            <button className="like-btn">▲</button>
            <span>{comment.likes}</span>
            <button className="dislike-btn">▼</button>
          </div>
        </div>
      </div>

      {/* RECURSIVE REPLIES */}
      {comment.replies?.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(rep => (
            <Comment key={rep.id} comment={rep} />
          ))}
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxImg && (
        <div className="lightbox-backdrop" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} className="lightbox-image" alt="" />
        </div>
      )}
    </div>
  );
};

export default Comment;
