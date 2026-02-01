import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client'; // Import SockJS directly
import Stomp from 'stompjs';
import './ChatWidget.css';

const SOCKET_URL = 'http://localhost:8080/api/ws';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef(null);

    // Initial Setup
    useEffect(() => {
        // Generate or retrieve Session ID
        let storedSessionId = sessionStorage.getItem('chatSessionId');
        if (!storedSessionId) {
            storedSessionId = 'guest-' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('chatSessionId', storedSessionId);
        }
        setSessionId(storedSessionId);

        // Load messages from session storage
        const storedMessages = sessionStorage.getItem('chatMessages');
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        } else {
            // Welcome message
            const welcomeMsg = {
                id: Date.now(),
                sender: 'BOT',
                content: 'Xin chào! Tôi là trợ lý ảo AI. Tôi có thể giúp gì cho bạn hôm nay?',
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages([welcomeMsg]);
            sessionStorage.setItem('chatMessages', JSON.stringify([welcomeMsg]));
        }
    }, []);

    // Connect WebSocket when chat opens
    useEffect(() => {
        if (isOpen && !stompClient && sessionId) {
            connect();
        }
    }, [isOpen, sessionId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const connect = () => {
        const socket = new SockJS(SOCKET_URL);
        const client = Stomp.over(socket);

        // Disable debug logs to keep console clean
        client.debug = () => { };

        client.connect({}, () => {
            setIsConnected(true);

            // Subscribe to private queue
            client.subscribe(`/queue/chat/${sessionId}`, (message) => {
                const body = message.body;
                addMessage('BOT', body);
                setIsTyping(false);
            });
        }, (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
        });

        setStompClient(client);
    };

    const addMessage = (sender, content) => {
        const newMessage = {
            id: Date.now(),
            sender,
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => {
            const updated = [...prev, newMessage];
            sessionStorage.setItem('chatMessages', JSON.stringify(updated));
            return updated;
        });
    };

    const handleSendMessage = () => {
        if (!inputValue.trim() || !stompClient) return;

        // Add user message
        addMessage('USER', inputValue);

        // Send to backend
        stompClient.send("/app/chat.send", {}, JSON.stringify({
            sessionId: sessionId,
            content: inputValue
        }));

        setInputValue('');
        setIsTyping(true); // Assume bot is thinking
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleRequestHuman = () => {
        if (!stompClient) return;

        addMessage('USER', 'Tôi muốn gặp nhân viên tư vấn');

        stompClient.send("/app/chat.send", {}, JSON.stringify({
            sessionId: sessionId,
            content: 'human' // Keyword handled by backend
        }));

        setIsTyping(true);
    };

    const formatMessage = (text) => {
        if (!text) return '';
        // Replace ": " with ":\n"
        let newText = text.replace(/:\s+/g, ':\n');
        // Replace "? " with "?\n"
        newText = newText.replace(/\?\s+/g, '?\n');
        // Ensure numbered lists start on new line
        newText = newText.replace(/\s+(\d+\.)\s/g, '\n$1 ');
        // Ensure bullet points start on new line
        newText = newText.replace(/\s+(-\s)/g, '\n$1');
        return newText;
    };

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    className="chat-widget-toggle"
                    onClick={() => setIsOpen(true)}
                    title="Chat với chúng tôi"
                >
                    <i className="bi bi-chat-dots-fill"></i>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-title">Hỗ trợ trực tuyến</div>
                            <div className="chat-status">
                                <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}
                                    style={{ background: isConnected ? '#4ade80' : '#ccc' }}></span>
                                {isConnected ? 'Đang hoạt động' : 'Mất kết nối'}
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                            <i className="bi bi-x"></i>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message-bubble ${msg.sender === 'USER' ? 'sent' : 'received'}`}
                            >
                                <div className="message-content">{formatMessage(msg.content)}</div>
                                <div className="message-time">{msg.timestamp}</div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="message-bubble received">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer */}
                    <div className="chat-footer">
                        <div className="chat-actions">
                            <button className="action-chip" onClick={handleRequestHuman}>
                                <i className="bi bi-headset me-1"></i> Gặp nhân viên
                            </button>
                        </div>
                        <div className="chat-input-container">
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Nhập tin nhắn..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button className="chat-send-btn" onClick={handleSendMessage} disabled={!inputValue.trim()}>
                                <i className="bi bi-send-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
