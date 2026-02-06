import { useState, useEffect, useRef } from 'react';
import ChatService from '../../../services/ChatService';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import './AdminChat.scss'; // Assuming we'll create this or use inline

const SOCKET_URL = 'http://localhost:8080/api/ws';

const AdminChat = () => {
    const [queue, setQueue] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Auto scroll ref
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchQueue();
        connectWebSocket();

        return () => {
            if (stompClient) stompClient.disconnect();
        };
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const fetchQueue = async () => {
        try {
            const data = await ChatService.getQueue();
            setQueue(data);
        } catch (error) {
            console.error(error);
        }
    };

    const connectWebSocket = () => {
        const socket = new SockJS(SOCKET_URL);
        const client = Stomp.over(socket);
        client.debug = () => { };

        // Add Auth header if needed (JWT)
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        client.connect(headers, () => {
            setIsConnected(true);

            // Listen to Queue Updates
            client.subscribe('/topic/admin/queue', (message) => {
                setQueue(JSON.parse(message.body));
            });
        }, (err) => {
            console.error(err);
            setIsConnected(false);
        });

        setStompClient(client);
    };

    const handlePickUser = async () => {
        try {
            const sessionId = await ChatService.pickUser();
            if (sessionId === "Hàng đợi rỗng.") {
                alert("Queue is empty!");
                return;
            }
            selectSession(sessionId);
        } catch (error) {
            console.error(error);
        }
    };

    const selectSession = async (sessionId) => {
        setSelectedSession(sessionId);

        // Load history
        try {
            const history = await ChatService.getHistory(sessionId);
            setMessages(history);
        } catch (error) {
            console.error("Failed to load history", error);
            setMessages([]);
        }

        // Subscribe to this session if not already
        if (stompClient && stompClient.connected) {
            // Unsubscribe previous if complicated logic, but StompJS handles multiple subs
            // We'll just subscribe.
            stompClient.subscribe(`/topic/admin/session/${sessionId}`, (message) => {
                // Incoming User Message
                // Format: "USER: content"
                // We need to parse it or just display raw
                const body = message.body;
                let content = body;
                let sender = 'USER';

                if (body.startsWith('USER: ')) {
                    content = body.substring(6);
                }

                setMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: sender,
                    content: content,
                    timestamp: new Date().toLocaleTimeString()
                }]);
            });
        }
    };

    const handleSendMessage = () => {
        if (!inputValue.trim() || !selectedSession || !stompClient) return;

        stompClient.send("/app/chat.admin.send", {}, JSON.stringify({
            sessionId: selectedSession,
            content: inputValue
        }));

        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'ADMIN',
            content: inputValue,
            timestamp: new Date().toLocaleTimeString()
        }]);
        setInputValue('');
    };

    const handleEndSession = async () => {
        if (!selectedSession) return;
        if (!window.confirm("Kết thúc hỗ trợ khách hàng này?")) return;

        try {
            await ChatService.endSession(selectedSession);
            setSelectedSession(null);
            setMessages([]);
            fetchQueue(); // Refresh queue
        } catch (error) {
            console.error(error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    return (
        <div className="admin-chat-container" style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: '20px' }}>
            {/* Left Panel: Queue & Active */}
            <div className="chat-sidebar" style={{ width: '300px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 className="mb-3 text-primary">Hàng đợi ({queue.length})</h3>
                <div className="queue-list mb-4">
                    {queue.length === 0 ? (
                        <p className="text-muted">Không có ai đang chờ.</p>
                    ) : (
                        <ul className="list-group">
                            {queue.map((sId, idx) => (
                                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Khách {sId.substr(0, 8)}...</span>
                                    {/* Using button directly here to pick specific user if API supported, currently API pops head */}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button
                    className="btn btn-primary w-100 mb-3"
                    onClick={handlePickUser}
                    disabled={queue.length === 0}
                >
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Tiếp nhận khách tiếp theo
                </button>

                {selectedSession && (
                    <div className="current-session p-3 bg-light rounded border border-primary">
                        <strong>Đang chat với:</strong>
                        <div className="text-truncate text-primary fw-bold">{selectedSession}</div>
                        <button className="btn btn-sm btn-danger mt-2 w-100" onClick={handleEndSession}>
                            Kết thúc phiên
                        </button>
                    </div>
                )}
            </div>

            {/* Right Panel: Chat Window */}
            <div className="chat-main" style={{ flex: 1, background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selectedSession ? (
                    <>
                        <div className="chat-main-header p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
                            <h5 className="m-0 text-dark">
                                <i className="bi bi-chat-dots me-2 text-primary"></i>
                                {selectedSession}
                            </h5>
                            <span className="badge bg-success">Online</span>
                        </div>

                        <div className="chat-main-messages p-3" style={{ flex: 1, overflowY: 'auto', background: '#f8f9fa' }}>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`d-flex flex-column mb-3 ${msg.sender === 'ADMIN' ? 'align-items-end' : 'align-items-start'}`}
                                >
                                    <div
                                        className={`p-3 rounded-3 shadow-sm ${msg.sender === 'ADMIN' ? 'bg-primary text-white' : 'bg-white text-dark border'}`}
                                        style={{ maxWidth: '70%', wordBreak: 'break-word' }}
                                    >
                                        {msg.content}
                                    </div>
                                    <small className="text-muted mt-1">{msg.timestamp}</small>
                                </div>
                            ))}
                            <div ref={messagesEndRef}></div>
                        </div>

                        <div className="chat-main-input p-3 border-top bg-white">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhập tin nhắn..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button className="btn btn-primary" onClick={handleSendMessage}>
                                    <i className="bi bi-send-fill"></i>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                        <i className="bi bi-chat-square-quote display-1 mb-3 opacity-25"></i>
                        <h4>Chưa chọn khách hàng nào</h4>
                        <p>Vui lòng tiếp nhận khách từ hàng đợi để bắt đầu chat.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
