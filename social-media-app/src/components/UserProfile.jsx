import React, { useEffect, useState } from "react";
import { authFetch } from "../authFetch";
import defaultAvatar from "../assets/default-avatar.png";

const UserProfile = ({ userId, onBack }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // читаем текущего юзера прямо здесь
  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    console.error("Ошибка парсинга user из localStorage:", e);
  }

  const isOwnProfile = storedUser && storedUser.id === userId;

  useEffect(() => {
    setLoading(true);
    setError(null);

    authFetch(`/api/users/${userId}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить профиль");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => setError(err.message || "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDelete = async () => {
    if (!window.confirm("Точно удалить аккаунт? Это действие необратимо.")) return;

    try {
      setDeleting(true);
      const res = await authFetch(`/api/users/${userId}/`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Не удалось удалить аккаунт");
      }

      if (isOwnProfile) {
        localStorage.removeItem("user");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.reload();
      } else {
        onBack();
      }
    } catch (e) {
      alert(e.message || "Ошибка при удалении аккаунта");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p>Загрузка профиля...</p>;
  if (error)
    return (
      <div>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={onBack}>Назад</button>
      </div>
    );

  return (
    <div className="user-profile">
      <button onClick={onBack} style={{ marginBottom: 16 }}>
        ← Назад к комментариям
      </button>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <img
          src={profile.avatar || defaultAvatar}
          alt={profile.username}
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <div>
          <h2>
            {profile.first_name || profile.last_name
              ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
              : profile.username}
          </h2>
          <p>
            <b>Username:</b> {profile.username}
          </p>
          <p>
            <b>Email:</b> {profile.email}
          </p>
          {profile.bio && (
            <p>
              <b>Bio:</b> {profile.bio}
            </p>
          )}
          <p>
            <b>Создан:</b> {new Date(profile.created).toLocaleString("ru-RU")}
          </p>
        </div>
      </div>

      {isOwnProfile && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              backgroundColor: "#e53935",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {deleting ? "Удаление..." : "Удалить аккаунт"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
