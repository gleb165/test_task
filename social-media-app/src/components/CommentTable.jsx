import React from "react";
import Comment from "./Comment";

const SORT_FIELDS = [
  { key: "username", label: "Имя" },
  { key: "email", label: "Email" },
  { key: "created", label: "Дата" },
];

function CommentTable({ comments, onPageChange, page, pageCount, onSort, sortField, sortOrder }) {
  return (
    <div className="comment-table-wrapper">
      <table className="comment-table">
        <thead>
          <tr>
            {SORT_FIELDS.map(f => (
              <th key={f.key}>
                <button className="sort-btn" onClick={() => onSort(f.key)}>
                  {f.label}{" "}
                  {sortField === f.key ? (sortOrder === "desc" ? "↓" : "↑") : ""}
                </button>
              </th>
            ))}
            <th>Комментарий</th>
          </tr>
        </thead>

        <tbody>
          {comments.map(comment => (
            <tr key={comment.id}>
              <td>{comment.username}</td>
              <td>{comment.email}</td>
              <td>{comment.timestamp}</td>
              <td>
                <Comment comment={comment} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          Назад
        </button>
        <span>Стр. {page} / {pageCount}</span>
        <button disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>
          Вперёд
        </button>
      </div>
    </div>
  );
}

export default CommentTable;
