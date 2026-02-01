import { useState, useEffect } from 'react';
import { StatCard } from '../../../components/common/Admin';
import ReportService from '../../../services/reportService';

export default function ChatbotReport({ fromDate, toDate, filterTrigger, onDataLoad }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [fromDate, toDate, filterTrigger]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await ReportService.getChatbotStats(fromDate, toDate);
            setData(result);
            onDataLoad?.(result);
        } catch (error) {
            console.error('Fetch chatbot stats error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="report-loading">
                <div className="report-loading-spinner"></div>
            </div>
        );
    }

    if (!data) return null;

    const maxConversations = Math.max(...data.chartData.map(d => d.conversations));

    return (
        <>
            {/* Stats Cards */}
            <div className="stats-grid">
                <StatCard
                    title="Tổng hội thoại"
                    value={data.summary.totalConversations}
                    icon="bi-chat-dots-fill"
                    variant="primary"
                />
                <StatCard
                    title="Tổng tin nhắn"
                    value={data.summary.totalMessages}
                    icon="bi-chat-text-fill"
                    variant="info"
                />
                <StatCard
                    title="Phản hồi TB"
                    value={data.summary.avgResponseTime}
                    icon="bi-clock-fill"
                    variant="warning"
                />
                <StatCard
                    title="Tỷ lệ hài lòng"
                    value={`${data.summary.satisfactionRate}%`}
                    icon="bi-emoji-smile-fill"
                    variant="success"
                />
            </div>

            {/* Chart & Top Questions */}
            <div className="report-grid">
                {/* Bar Chart */}
                <div className="report-chart-card">
                    <div className="report-chart-header">
                        <h3 className="report-chart-title">Hội thoại theo ngày</h3>
                    </div>
                    <div className="chart-wrapper">
                        <div className="simple-bar-chart">
                            {data.chartData.map((item, index) => (
                                <div key={index} className="bar-item">
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${(item.conversations / maxConversations) * 200}px`,
                                            background: 'linear-gradient(180deg, #6366f1, #4f46e5)'
                                        }}
                                    >
                                        <span className="bar-value">{item.conversations}</span>
                                    </div>
                                    <span className="bar-label">
                                        {new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Questions */}
                <div className="report-chart-card">
                    <div className="report-chart-header">
                        <h3 className="report-chart-title">Top câu hỏi thường gặp</h3>
                    </div>
                    <div className="top-list">
                        {data.topQuestions.map((item, index) => (
                            <div key={index} className="top-list-item">
                                <div className={`top-rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
                                    {index + 1}
                                </div>
                                <div className="top-info">
                                    <div className="top-name">{item.question}</div>
                                </div>
                                <div className="top-value">{item.count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Conversations Table */}
            <div className="report-table-card">
                <div className="report-table-header">
                    <h3 className="report-table-title">Phiên chat gần đây</h3>
                </div>
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Mã phiên</th>
                            <th>Người dùng</th>
                            <th>Tin nhắn</th>
                            <th>Thời lượng</th>
                            <th>Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.recentConversations.map((conv, index) => (
                            <tr key={index}>
                                <td><strong>{conv.id}</strong></td>
                                <td>{conv.user}</td>
                                <td>{conv.messages}</td>
                                <td>{conv.duration}</td>
                                <td>{conv.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
