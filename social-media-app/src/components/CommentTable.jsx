import React from "react";
import './CommentTable.css';

const SORT_FIELDS = [
  { key: "username", label: "Имя" },
  { key: "email", label: "Email" },
  { key: "created", label: "Дата" },
];

// Добавим пропс onAddComment
function CommentTable({ comments, onPageChange, page, pageCount, onSort, sortField, sortOrder, onSelect, onAddComment }) {
  return (
    <div className="comment-table-wrapper">
      
      {/* Кнопка для открытия модального окна */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 className="comment-title">Комментарии</h2>
        <button className="add-comment-btn" onClick={onAddComment}>
            Добавить комментарий
        </button>
      </div>
      
      <table className="comment-table">
        <thead>
          {/* ... остальной код thead ... */}
          <tr>
            {SORT_FIELDS.map(f => (
              <th key={f.key} className="th-col">
                <button className="sort-btn" onClick={() => onSort(f.key)}>
                  {f.label} {sortField === f.key ? (sortOrder === "desc" ? "↓" : "↑") : ""}
                </button>
              </th>
            ))}
            <th className="th-comment">Комментарий</th>
          </tr>
        </thead>

        <tbody>
          {/* ... остальной код tbody ... */}
          {comments.map(comment => (
            <tr key={comment.id} 
            onClick={() => onSelect(comment.id)} 
            className="clickable-row">
              <td className="td-username">{comment.username}</td>
              <td className="td-email">{comment.email}</td>
              <td className="td-date">{new Date(comment.created).toLocaleString()}</td>
              <td className="td-comment">{comment.text}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ... остальной код пагинации ... */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>← Назад</button>
        <span>Стр. {page} / {pageCount}</span>
        <button disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>Вперёд →</button>
      </div>
    </div>
  );
}

export default CommentTable;