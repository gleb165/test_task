import React from "react";
import "./Comment.css";

const Comment = ({ comment }) => {
  return (
    <div className="comment-wrapper">
      <div className="comment-card">

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

        <div className="comment-body">
          <p>{comment.text}</p>

          {comment.attachments?.length > 0 && (
            <div className="attachments">
              {comment.attachments.map(att =>
                att.attachment_type === "image" ? (
                  <img
                    key={att.id}
                    src={att.file}
                    alt=""
                  />
                ) : null
              )}
            </div>
          )}
        </div>

        <div className="comment-footer">
          <button className="reply-btn">Ответить</button>

          <div className="like-block">
            <button className="like-btn">▲</button>
            <span>{comment.likes}</span>
            <button className="dislike-btn">▼</button>
          </div>
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(rep => (
            <Comment key={rep.id} comment={rep} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
