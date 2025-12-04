import React, { useEffect, useState } from "react";
import CommentTable from "../components/CommentTable";
import CommentsPage from "../components/CommentsPage";
import CreateCommentModal from "../components/CreateCommentModal"; 
import { authFetch } from "../authFetch";

const PAGE_SIZE = 25;

function Home() {
    // --- ЛОГИКА АВТОРИЗАЦИИ (ИСКЛЮЧИТЕЛЬНО ВНУТРИ КОМПОНЕНТА) ---
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Ошибка парсинга данных пользователя из localStorage:", e);
            localStorage.removeItem('user'); 
          }
        }
    }, []);

    const isUserAuthenticated = user !== null; 
    const currentUser = isUserAuthenticated 
        ? { username: user.username, email: user.email }
        : {};
    // ------------------------------------------------------------------
    
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [sortField, setSortField] = useState('created');
    const [sortOrder, setSortOrder] = useState('desc');
    const [total, setTotal] = useState(0);

    const [selectedComment, setSelectedComment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 

    const fetchComments = () => {
        setLoading(true);
        setError(null);

        authFetch(`/api/comments/?page=${page}&sort_by=${sortField}&order=${sortOrder}`)
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then((data) => {
                const mappedComments = (data.results || []).map(comment => ({
                    id: comment.id,
                    username: comment.author_name || (comment.author?.name || comment.guest_name),
                    email: comment.author_email || (comment.author?.email || comment.guest_email),
                    avatar: comment.author?.avatar || '/default-avatar.png',
                    timestamp: new Date(comment.created).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }),
                    created: comment.created,
                    text: comment.text,
                    likes: comment.likes_count,
                    liked: comment.liked,
                    attachments: comment.attachments,
                    replies: comment.replies || [],
                }));

                setComments(mappedComments);
                setTotal(data.count || 0);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });

    };
    

    useEffect(() => {
        fetchComments();
    }, [page, sortField, sortOrder]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
        setPage(1);
    };

    const handleCommentCreated = () => {
        setIsModalOpen(false); 
        setPage(1); 
        setSortField('created');
        setSortOrder('desc');
    }

    const pageCount = Math.ceil(total / PAGE_SIZE);

    return (
        <div className="comments-container">

            {loading && <p>Загрузка...</p>}
            {error && <p style={{color: 'red'}}>Ошибка: {error}</p>}

            {selectedComment ? (
                <div>
                    <button onClick={() => setSelectedComment(null)}>← Назад</button>
                    <CommentsPage commentId={selectedComment} />
                </div>
            ) : (
                <CommentTable
                    comments={comments}
                    onPageChange={setPage}
                    page={page}
                    pageCount={pageCount}
                    onSort={handleSort}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSelect={setSelectedComment}
                    onAddComment={() => setIsModalOpen(true)} 
                />
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
