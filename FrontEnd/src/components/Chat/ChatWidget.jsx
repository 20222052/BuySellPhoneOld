import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import './ChatWidget.css';

const SOCKET_URL = 'http://localhost:8080/api/ws';

// ── Inline Product Card component ────────────────────────────────────────────
const ProductCard = ({ product }) => {
    const formatPrice = (price) => {
        if (price == null || price === undefined) return '';
        const num = typeof price === 'string' ? parseFloat(price) : Number(price);
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
    };

    const handleClick = () => {
        window.location.href = `/products/${product.id}`;
    };

    return (
        <div className="chat-product-card" onClick={handleClick}>
            <div className="chat-product-img-wrap">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name || product.productName} className="chat-product-img" />
                ) : (
                    <div className="chat-product-img-placeholder">
                        <i className="bi bi-phone"></i>
                    </div>
                )}
            </div>
            <div className="chat-product-info">
                {product.brandName && <div className="chat-product-brand">{product.brandName}</div>}
                <div className="chat-product-name">{product.name || product.productName || 'Sản phẩm'}</div>
                {product.sellPrice != null && (
                    <div className="chat-product-price">{formatPrice(product.sellPrice)}</div>
                )}
                {product.comparePrice != null && Number(product.comparePrice) > Number(product.sellPrice) && (
                    <div className="chat-product-compare">{formatPrice(product.comparePrice)}</div>
                )}
            </div>
            <button className="chat-product-btn" onClick={handleClick}>
                <i className="bi bi-arrow-right-circle-fill"></i>
            </button>
        </div>
    );
};


// ── Main ChatWidget ───────────────────────────────────────────────────────────
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
        let storedSessionId = sessionStorage.getItem('chatSessionId');
        if (!storedSessionId) {
            storedSessionId = 'guest-' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('chatSessionId', storedSessionId);
        }
        setSessionId(storedSessionId);

        const storedMessages = sessionStorage.getItem('chatMessages');
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        } else {
            const welcomeMsg = {
                id: Date.now(),
                sender: 'BOT',
                text: 'Xin chào! Tôi là trợ lý ảo AI. Tôi có thể giúp gì cho bạn hôm nay?',
                products: [],
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
        client.debug = () => { };

        client.connect({}, () => {
            setIsConnected(true);

            client.subscribe(`/queue/chat/${sessionId}`, (message) => {
                const body = message.body;
                // Thử parse JSON (ChatBotResponse từ bot), nếu không thì plain text
                let text = body;
                let products = [];
                try {
                    const parsed = JSON.parse(body);
                    if (parsed && parsed.text !== undefined) {
                        text = parsed.text;
                        products = parsed.products || [];
                    }
                } catch (_) {
                    // plain text (SYSTEM / AGENT messages)
                }
                addMessage('BOT', text, products);
                setIsTyping(false);
            });
        }, (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
        });

        setStompClient(client);
    };

    const addMessage = (sender, text, products = []) => {
        const newMessage = {
            id: Date.now(),
            sender,
            text,
            products,
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
        addMessage('USER', inputValue);
        stompClient.send('/app/chat.send', {}, JSON.stringify({
            sessionId: sessionId,
            content: inputValue
        }));
        setInputValue('');
        setIsTyping(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    const handleRequestHuman = () => {
        if (!stompClient) return;
        addMessage('USER', 'Tôi muốn gặp nhân viên tư vấn');
        stompClient.send('/app/chat.send', {}, JSON.stringify({
            sessionId: sessionId,
            content: 'human'
        }));
        setIsTyping(true);
    };

    // Render markdown-lite: bold + newline
    const renderText = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, i) => {
            // Bold: **text**
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
                <span key={i}>
                    {parts.map((part, j) =>
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                    )}
                    {i < lines.length - 1 && <br />}
                </span>
            );
        });
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
                                {/* Text content */}
                                <div className="message-content">
                                    {renderText(msg.text || msg.content)}
                                </div>

                                {/* Product cards (only for BOT messages with products) */}
                                {msg.sender === 'BOT' && msg.products && msg.products.length > 0 && (
                                    <div className="chat-product-list">
                                        {msg.products.map((p) => (
                                            <ProductCard key={p.id} product={p} />
                                        ))}
                                    </div>
                                )}

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
