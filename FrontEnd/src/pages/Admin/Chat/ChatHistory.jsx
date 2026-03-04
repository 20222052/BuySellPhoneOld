import { useState, useEffect } from 'react';
import ChatService from '../../../services/ChatService';
import { Modal } from 'react-bootstrap';

const ChatHistory = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConv, setSelectedConv] = useState(null); // For modal details

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await ChatService.getAllHistory();
            setConversations(data);
        } catch (error) {
            console.error("Load history error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (conv) => {
        setSelectedConv(conv);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="card shadow-sm">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h4 className="card-title m-0 text-primary">
                    <i className="bi bi-clock-history me-2"></i>
                    Lịch sử hội thoại
                </h4>
                <button className="btn btn-outline-primary btn-sm" onClick={loadConversations}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
                </button>
            </div>
            <div className="card-body p-0">
                {loading ? (
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Session ID</th>
                                    <th>Khách hàng</th>
                                    <th>Thời gian</th>
                                    {/* <th>Trạng thái</th> */}
                                    <th>Tin nhắn cuối</th>
                                    <th className="text-end pe-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conversations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center p-4 text-muted">Không có dữ liệu</td>
                                    </tr>
                                ) : (
                                    conversations.map((conv) => (
                                        <tr key={conv.id}>
                                            <td className="ps-4">
                                                <code>{conv.sessionId?.substring(0, 8)}...</code>
                                            </td>
                                            <td>
                                                {conv.user ? conv.user.email : <span className="badge bg-secondary">Khách vãng lai</span>}
                                            </td>
                                            <td>{formatDate(conv.lastMessageAt || conv.createdAt)}</td>
                                            {/* <td>
                                                <span className={`badge ${conv.status === 'CLOSED' ? 'bg-secondary' : 'bg-success'}`}>
                                                    {conv.status}
                                                </span>
                                            </td> */}
                                            <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                                {conv.messages?.length > 0
                                                    ? [...conv.messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).at(-1)?.content
                                                    : ''}
                                            </td>
                                            <td className="text-end pe-4">
                                                <button
                                                    className="btn btn-sm btn-info text-white"
                                                    onClick={() => handleViewDetail(conv)}
                                                >
                                                    <i className="bi bi-eye"></i> Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Detail */}
            <Modal show={!!selectedConv} onHide={() => setSelectedConv(null)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết hội thoại</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-light" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {selectedConv && selectedConv.messages && selectedConv.messages.length > 0 ? (
                        <div className="d-flex flex-column gap-3">
                            {[...selectedConv.messages]
                                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                .map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`d-flex flex-column ${msg.senderType === 'USER' ? 'align-items-end' : 'align-items-start'}`}
                                    >
                                        <div
                                            className={`p-3 rounded-3 shadow-sm ${msg.senderType === 'USER' ? 'bg-primary text-white' : 'bg-white text-dark border'}`}
                                            style={{ maxWidth: '80%' }}
                                        >
                                            {msg.content}
                                        </div>
                                        <small className="text-muted mt-1">
                                            {formatDate(msg.createdAt)} - {msg.senderType}
                                        </small>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted p-3">Không có tin nhắn nào.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={() => setSelectedConv(null)}>
                        Đóng
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ChatHistory;
