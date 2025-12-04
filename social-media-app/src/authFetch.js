function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
  
  async function refreshAccessToken(refresh) {
    const res = await fetch("/api/auth/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh })
    });
  
    if (!res.ok) return null;
  
    const data = await res.json();
    localStorage.setItem("access", data.access);
    return data.access;
  }
  
  export async function authFetch(url, options = {}) {
    let access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
  
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
  
    // если есть access — проверяем срок
    if (access) {
      const payload = parseJwt(access);
      const now = Math.floor(Date.now() / 1000);
  
      // заодно можно сделать "запас" в 30 секунд
      if (payload && payload.exp && payload.exp - now < 30 && refresh) {
        const newAccess = await refreshAccessToken(refresh);
        if (newAccess) {
          access = newAccess;
        } else {
          // рефреш не сработал — чистим и редиректим
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.reload();
        }
      }
    }
  
    if (access) {
      headers["Authorization"] = `Bearer ${access}`;
    }
  
    const opts = { ...options, headers };
  
    let response = await fetch(url, opts);
  
    // Фоллбек на случай, если сервер всё-таки дал 401
    if (response.status === 401 && refresh) {
      const newAccess = await refreshAccessToken(refresh);
      if (!newAccess) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.reload();
        return response;
      }
  
      headers["Authorization"] = `Bearer ${newAccess}`;
      const retryOpts = { ...options, headers };
      response = await fetch(url, retryOpts);
    }
  
    return response;
  }
  