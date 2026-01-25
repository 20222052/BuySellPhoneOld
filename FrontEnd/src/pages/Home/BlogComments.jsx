import React, { useState } from 'react';
// Nếu bạn dùng icon từ thư viện (ví dụ react-icons hoặc bootstrap-icons), hãy import ở đây.
// Ở đây mình dùng class của Bootstrap Icons như code cũ.

import '../../assets/css/home/Blogs/BlogComments.css';

const MOCK_COMMENTS = [
    {
        id: 1,
        user: "Nguyễn Thanh Tùng",
        avatar: "NT", // Có thể là URL ảnh hoặc Initials
        content: "Bài viết rất hữu ích, cảm ơn tác giả đã chia sẻ! Mình rất thích phần phân tích về UI/UX.",
        time: "2 giờ trước",
        likes: 5,
        replies: [
            {
                id: 101,
                user: "Admin",
                avatar: "https://img.freepik.com/premium-vector/cute-robot-mascot-logo-cartoon-character-illustration_352902-83.jpg",
                isAdmin: true,
                content: "Cảm ơn bạn Tùng đã ủng hộ nhé!",
                time: "1 giờ trước",
                likes: 1
            }
        ]
    },
    {
        id: 2,
        user: "Trần Minh",
        avatar: "TM",
        content: "Cho mình hỏi thêm về phần React Hooks được không?",
        time: "30 phút trước",
        likes: 0,
        replies: []
    }
];

// --- Sub-component: Hiển thị từng Comment ---
const CommentItem = ({ comment, isReply = false }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    const handleReplySubmit = () => {
        if (!replyText.trim()) return;
        alert(`Đã trả lời comment của ${comment.user}: ${replyText}`);
        setReplyText("");
        setIsReplying(false);
    };

    // Hàm render Avatar (Hỗ trợ cả ảnh và chữ cái đầu)
    const renderAvatar = (avatar, name) => {
        if (avatar && (avatar.startsWith('http') || avatar.startsWith('/'))) {
            return <img src={avatar} alt={name} className="avatar-img" />;
        }
        return <div className="avatar-initials">{avatar || name.charAt(0)}</div>;
    };

    return (
        <div className={`comment-item ${isReply ? 'is-reply' : ''}`}>
            <div className="d-flex gap-2">
                {/* Avatar */}
                <div className="comment-avatar-wrapper">
                    {renderAvatar(comment.avatar, comment.user)}
                </div>

                {/* Content Area */}
                <div className="comment-body">
                    {/* Bubble: Chứa tên và nội dung */}
                    <div className="comment-bubble">
                        <div className="comment-user-name">
                            {comment.user}
                            {comment.isAdmin && <span className="badge-admin">Tác giả</span>}
                        </div>
                        <div className="comment-text">{comment.content}</div>
                    </div>

                    {/* Actions: Like, Reply, Time */}
                    <div className="comment-actions-row">
                        <span className="action-btn like-btn">Thích ({comment.likes})</span>
                        <span className="action-btn reply-btn" onClick={() => setIsReplying(!isReplying)}>
                            Trả lời
                        </span>
                        <span className="comment-time">{comment.time}</span>
                    </div>

                    {/* Form trả lời (Chỉ hiện khi bấm Trả lời) */}
                    {isReplying && (
                        <div className="reply-input-container fade-in">
                            <input 
                                type="text" 
                                className="reply-input"
                                autoFocus
                                placeholder={`Trả lời ${comment.user}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
                            />
                            <div className="reply-actions text-end mt-1">
                                <button className="btn-tiny-cancel" onClick={() => setIsReplying(false)}>Hủy</button>
                                <button 
                                    className="btn-tiny-submit" 
                                    disabled={!replyText.trim()}
                                    onClick={handleReplySubmit}
                                >
                                    Gửi
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recursion: Render các replies con */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="replies-list">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} isReply={true} />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
const BlogComments = () => {
    const [comments, setComments] = useState(MOCK_COMMENTS);
    const [newComment, setNewComment] = useState("");

    const handleSubmit = () => {
        if (!newComment.trim()) return;
        
        const newObj = {
            id: Date.now(),
            user: "Khách", // Demo user
            avatar: "K",
            content: newComment,
            time: "Vừa xong",
            likes: 0,
            replies: []
        };
        
        setComments([newObj, ...comments]);
        setNewComment("");
    };

    return (
        <div className="blog-comments-wrapper">
            <div className="container-custom">
                <div className="comments-header-modern">
                    <h3>Bình luận <span className="count-badge">{comments.length}</span></h3>
                </div>

                {/* Main Input Area */}
                <div className="main-input-area">
                    <img
                        src="https://img.freepik.com/premium-vector/cute-robot-mascot-logo-cartoon-character-illustration_352902-83.jpg"
                        alt="User"
                        className="current-user-avatar-lg"
                    />
                    <div className="input-box-wrapper">
                        <textarea
                            className="main-textarea"
                            placeholder="Viết bình luận của bạn..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={2}
                        />
                        <div className={`main-input-footer ${newComment.trim() ? 'expanded' : ''}`}>
                            <button 
                                className="btn-main-submit" 
                                disabled={!newComment.trim()}
                                onClick={handleSubmit}
                            >
                                <i className="bi bi-send-fill"></i> Gửi bình luận
                            </button>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                <div className="comments-tree">
                    {comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogComments;