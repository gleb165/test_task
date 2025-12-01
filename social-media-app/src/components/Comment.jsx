import React from 'react';
import './Comment.css';

const Comment = ({ comment }) => {
return (
    <div className={`comment-card${comment.reply ? ' reply' : ''}`}>  
    <div className="comment-header">
        <img className="avatar" src={comment.avatar} alt="avatar" />
        <div className="comment-meta">
        <span className="username">{comment.username}</span>
        <span className="timestamp">{comment.timestamp}</span>
        </div>
    </div>
    <div className="comment-body">
        <p>{comment.text}</p>
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="comment-attachments">
            {comment.attachments.map(att => (
              att.attachment_type === 'image' ? (
                <img key={att.id} src={att.file} alt="attachment" className="comment-image" />
              ) : null
            ))}
          </div>
        )}
    </div>
    <div className="comment-actions">
        <button>Ответить</button>
        <button>
          ⭡ {comment.likes}
        </button>
        <button>
          ⭣ {comment.likes}
        </button>
    </div>
    {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
        {comment.replies.map((reply, idx) => (
            <Comment key={idx} comment={reply} />
        ))}
        </div>
    )}
    </div>
);
};

export default Comment;
