import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import BlogService from '../../services/blogService';
import '../../assets/css/home/Blogs/BlogComments.css';

// ─────────────────────────────────────────────
// Helper: Format thời gian relative (VD: "2 giờ trước")
// ─────────────────────────────────────────────
const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 30) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};

// ─────────────────────────────────────────────
// Helper: Avatar (URL hoặc chữ cái đầu)
// ─────────────────────────────────────────────
const Avatar = ({ src, name, size = 'md' }) => {
    const sizeClass = size === 'lg' ? 'avatar-lg' : 'avatar-md';
    const initials = name
        ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    if (src && (src.startsWith('http') || src.startsWith('/'))) {
        return <img src={src} alt={name} className={`comment-avatar ${sizeClass}`} />;
    }
    return (
        <div className={`comment-avatar avatar-initials ${sizeClass}`}>
            {initials}
        </div>
    );
};

// ─────────────────────────────────────────────
// Sub-component: Reply Form
// ─────────────────────────────────────────────
const ReplyForm = ({ comment, currentUser, onSubmit, onCancel }) => {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!text.trim()) return;
        if (text.trim().length > 2000) {
            setError('Nội dung không được vượt quá 2000 ký tự');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await onSubmit(comment.id, text.trim());
            setText('');
        } catch (err) {
            setError(err.message || 'Gửi trả lời thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="reply-form fade-in">
            <Avatar src={currentUser?.avatarUrl} name={currentUser?.fullName || 'Bạn'} />
            <div className="reply-form-inner">
                <textarea
                    className="reply-textarea"
                    autoFocus
                    placeholder={`Trả lời ${comment.userFullName}...`}
                    value={text}
                    maxLength={2000}
                    onChange={(e) => { setText(e.target.value); setError(''); }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    rows={2}
                />
                {error && <p className="comment-error-msg">{error}</p>}
                <div className="char-count">{text.length}/2000</div>
                <div className="reply-form-actions">
                    <button className="btn-cancel-reply" onClick={onCancel}>Hủy</button>
                    <button
                        className="btn-submit-reply"
                        disabled={!text.trim() || submitting}
                        onClick={handleSubmit}
                    >
                        {submitting ? (
                            <span className="spinner-tiny" />
                        ) : (
                            <><i className="bi bi-send-fill" /> Gửi</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Sub-component: Single Comment Item
// ─────────────────────────────────────────────
const CommentItem = ({ comment, currentUser, isAuthenticated, isReply, onReply, onDelete }) => {
    const [showReplying, setShowReplying] = useState(false);
    const isOwner = currentUser && comment.userId === currentUser.id;

    return (
        <div className={`comment-item ${isReply ? 'is-reply' : ''}`}>
            <div className="d-flex gap-2 align-items-start">
                {/* Avatar */}
                <div className="comment-avatar-wrapper">
                    <Avatar src={comment.userAvatar} name={comment.userFullName} />
                </div>

                {/* Content */}
                <div className="comment-body">
                    <div className="comment-bubble">
                        <div className="comment-user-name">
                            {comment.userFullName || 'Người dùng'}
                        </div>
                        <div className="comment-text">{comment.content}</div>
                    </div>

                    {/* Actions */}
                    <div className="comment-actions-row">
                        {!isReply && isAuthenticated && (
                            <span
                                className="action-btn reply-btn"
                                onClick={() => setShowReplying(!showReplying)}
                            >
                                <i className="bi bi-reply" /> Trả lời
                            </span>
                        )}
                        {isOwner && (
                            <span
                                className="action-btn delete-btn"
                                onClick={() => onDelete(comment.id)}
                            >
                                <i className="bi bi-trash3" /> Xóa
                            </span>
                        )}
                        <span className="comment-time">
                            {formatRelativeTime(comment.createdAt)}
                        </span>
                    </div>

                    {/* Inline Reply Form */}
                    {showReplying && (
                        <ReplyForm
                            comment={comment}
                            currentUser={currentUser}
                            onSubmit={async (cid, text) => {
                                await onReply(cid, text);
                                setShowReplying(false);
                            }}
                            onCancel={() => setShowReplying(false)}
                        />
                    )}
                </div>
            </div>

            {/* Replies list */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="replies-list">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            currentUser={currentUser}
                            isAuthenticated={isAuthenticated}
                            isReply={true}
                            onReply={onReply}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────
// Main Component: BlogComments
// ─────────────────────────────────────────────
const BlogComments = ({ blogId }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [comments, setComments] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');

    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');

    const PAGE_SIZE = 10;

    // ── Fetch comments ──────────────────────────────────────
    const fetchComments = useCallback(async (pageNum = 0, append = false) => {
        if (!blogId) return;
        append ? setLoadingMore(true) : setLoading(true);
        setError('');
        try {
            const res = await BlogService.getComments(blogId, pageNum, PAGE_SIZE);
            const data = res.data; // PagingResponse
            const items = data?.items || [];
            setComments((prev) => append ? [...prev, ...items] : items);
            setTotalElements(data?.totalElements || 0);
            setHasMore(pageNum < (data?.totalPages || 1) - 1);
            setPage(pageNum);
        } catch (err) {
            setError(err.message || 'Không thể tải bình luận');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [blogId]);

    useEffect(() => {
        fetchComments(0);
    }, [fetchComments]);

    // ── Submit comment mới ─────────────────────────────────
    const handleSubmit = async () => {
        if (!newComment.trim()) {
            setSubmitError('Vui lòng nhập nội dung bình luận');
            return;
        }
        if (newComment.trim().length > 2000) {
            setSubmitError('Nội dung không được vượt quá 2000 ký tự');
            return;
        }
        setSubmitting(true);
        setSubmitError('');
        setSubmitSuccess('');
        try {
            const res = await BlogService.addComment(blogId, newComment.trim());
            const created = res.data;
            setComments((prev) => [{ ...created, replies: [] }, ...prev]);
            setTotalElements((t) => t + 1);
            setNewComment('');
            setSubmitSuccess('Bình luận của bạn đã được gửi!');
            setTimeout(() => setSubmitSuccess(''), 3000);
        } catch (err) {
            setSubmitError(err.message || 'Gửi bình luận thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Reply vào comment ──────────────────────────────────
    const handleReply = async (parentCommentId, content) => {
        const res = await BlogService.replyToComment(parentCommentId, content);
        const created = res.data;
        setComments((prev) =>
            prev.map((c) =>
                c.id === parentCommentId
                    ? { ...c, replies: [...(c.replies || []), created] }
                    : c
            )
        );
    };

    // ── Xóa comment ───────────────────────────────────────
    const handleDelete = async (commentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
        try {
            await BlogService.deleteComment(commentId);
            // Xóa khỏi state (top-level hoặc reply)
            setComments((prev) =>
                prev
                    .filter((c) => c.id !== commentId)
                    .map((c) => ({
                        ...c,
                        replies: (c.replies || []).filter((r) => r.id !== commentId),
                    }))
            );
            setTotalElements((t) => Math.max(0, t - 1));
        } catch (err) {
            alert(err.message || 'Không thể xóa bình luận');
        }
    };

    return (
        <div className="blog-comments-wrapper">
            <div className="container-custom">
                {/* Header */}
                <div className="comments-header-modern">
                    <h3>
                        Bình luận{' '}
                        <span className="count-badge">{totalElements}</span>
                    </h3>
                </div>

                {/* ── Input Area ── */}
                {isAuthenticated ? (
                    <div className="main-input-area">
                        <Avatar src={user?.avatarUrl} name={user?.fullName || 'Bạn'} size="lg" />
                        <div className="input-box-wrapper">
                            <textarea
                                className={`main-textarea ${submitError ? 'is-invalid' : ''}`}
                                placeholder="Viết bình luận của bạn..."
                                value={newComment}
                                maxLength={2000}
                                onChange={(e) => {
                                    setNewComment(e.target.value);
                                    setSubmitError('');
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                                rows={2}
                            />
                            <div className="char-count">{newComment.length}/2000</div>
                            {submitError && (
                                <p className="comment-error-msg">
                                    <i className="bi bi-exclamation-circle-fill" /> {submitError}
                                </p>
                            )}
                            {submitSuccess && (
                                <p className="comment-success-msg">
                                    <i className="bi bi-check-circle-fill" /> {submitSuccess}
                                </p>
                            )}
                            <div className={`main-input-footer ${newComment.trim() ? 'expanded' : ''}`}>
                                <button
                                    className="btn-main-submit"
                                    disabled={!newComment.trim() || submitting}
                                    onClick={handleSubmit}
                                >
                                    {submitting ? (
                                        <span className="spinner-tiny" />
                                    ) : (
                                        <><i className="bi bi-send-fill" /> Gửi bình luận</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="login-prompt-box">
                        <i className="bi bi-chat-square-text login-prompt-icon" />
                        <p>
                            Bạn cần{' '}
                            <Link to="/login" className="login-link">
                                đăng nhập
                            </Link>{' '}
                            để bình luận.
                        </p>
                    </div>
                )}

                {/* ── Comments List ── */}
                <div className="comments-tree">
                    {loading ? (
                        <div className="comments-loading">
                            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                            <span className="ms-2">Đang tải bình luận...</span>
                        </div>
                    ) : error ? (
                        <div className="comment-error-box">
                            <i className="bi bi-wifi-off" /> {error}
                            <button
                                className="btn-retry"
                                onClick={() => fetchComments(0)}
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="no-comments-msg">
                            <i className="bi bi-chat-dots" />
                            <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                currentUser={user}
                                isAuthenticated={isAuthenticated}
                                isReply={false}
                                onReply={handleReply}
                                onDelete={handleDelete}
                            />
                        ))
                    )}

                    {/* Load More */}
                    {hasMore && !loading && (
                        <div className="load-more-wrapper">
                            <button
                                className="btn-load-more"
                                disabled={loadingMore}
                                onClick={() => fetchComments(page + 1, true)}
                            >
                                {loadingMore ? (
                                    <><span className="spinner-tiny" /> Đang tải...</>
                                ) : (
                                    'Xem thêm bình luận'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogComments;