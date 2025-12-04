// CommentsPage.jsx
import React, { useEffect, useState } from "react";
import Comment from "./Comment";
import { authFetch } from "../authFetch";

/**
 * Props:
 *  - commentId: UUID выбранного комментария
 *  - onBack: optional функция для кнопки "Назад" (если нужна)
 */
export default function CommentsPage({ commentId, onBack }) {
  const [comment, setComment] = useState(null);
  const [loading, setLoading] = useState(Boolean(commentId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!commentId) {
      setComment(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    // Загружает replies рекурсивно для переданного comment object (использует endpoint /replies/)
    const loadRepliesRecursively = async (parentId) => {
      try {
        const res = await authFetch(`/api/comments/${parentId}/replies/`);
        if (!res.ok) throw new Error(`Replies load failed (${res.status})`);
        const replies = await res.json();

        // Для каждого reply загружаем его replies рекурсивно
        const withNested = await Promise.all(
          replies.map(async (r) => {
            const nested = await loadRepliesRecursively(r.id);
            return {
              id: r.id,
              username: r.author_name || r.guest_name,
              avatar: r.author?.avatar || "/default-avatar.png",
              created: r.created,
              text: r.text,
              likes: r.likes_count ?? 0,
              liked: r.liked ?? false,
              attachments: r.attachments ?? [],
              replies: nested,
            };
          })
        );

        return withNested;
      } catch (err) {
        console.error("loadRepliesRecursively error:", err);
        return [];
      }
    };

    const fetchComment = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authFetch(`/api/comments/${commentId}/`);
        if (!res.ok) throw new Error(`Failed to load comment (${res.status})`);
        const data = await res.json();

        // Преобразуем базовые поля в формат для Comment.jsx
        const mapped = {
          id: data.id,
          username: data.author_name || data.guest_name,
          avatar: data.author?.avatar || "/default-avatar.png",
          created: data.created,
          text: data.text,
          likes: data.likes_count ?? 0,
          liked: data.liked ?? false,
          attachments: data.attachments ?? [],
          replies: [],
        };

        // Загрузим вложенные ответы рекурсивно
        mapped.replies = await loadRepliesRecursively(mapped.id);

        if (!cancelled) setComment(mapped);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err.message || "Ошибка загрузки комментария");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchComment();

    return () => {
      cancelled = true;
    };
  }, [commentId]);

  if (loading) return <div>Загрузка комментария...</div>;
  if (error) return <div style={{ color: "red" }}>Ошибка: {error}</div>;
  if (!comment) return <div>Комментарий не найден</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {onBack && (
        <div style={{ marginBottom: 12 }}>
          <button onClick={onBack} style={{ background: "#111", color: "#fff", padding: "10px 16px", borderRadius: 4, border: "none", cursor: "pointer" }}>
            ← Назад
          </button>
        </div>
      )}

      <Comment comment={comment} />
    </div>
  );
}
