import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import OrdersReport from './OrdersReport';
import ProductsReport from './ProductsReport';
import ChatbotReport from './ChatbotReport';
import '../../../assets/css/admin/reports.css';

export default function Reports() {
    const [activeTab, setActiveTab] = useState('orders');
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });
    const [filterTrigger, setFilterTrigger] = useState(0);
    const [exporting, setExporting] = useState(false);

    const reportRef = useRef(null);
    const reportDataRef = useRef(null);

    const tabs = [
        { id: 'orders', label: 'Đơn hàng', icon: 'bi-box-seam' },
        { id: 'products', label: 'Sản phẩm', icon: 'bi-phone' },
        { id: 'chatbot', label: 'Chatbot', icon: 'bi-chat-dots' }
    ];

    const handleFilter = () => {
        setFilterTrigger(prev => prev + 1);
    };

    const handleExportPDF = async () => {
        if (!reportRef.current) return;

        setExporting(true);
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#1a1a2e'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`bao-cao-${activeTab}-${fromDate}-${toDate}.pdf`);
        } catch (error) {
            console.error('Export PDF error:', error);
            alert('Không thể xuất PDF. Vui lòng thử lại!');
        } finally {
            setExporting(false);
        }
    };

    const handleExportExcel = () => {
        if (!reportDataRef.current) {
            alert('Không có dữ liệu để xuất!');
            return;
        }

        setExporting(true);
        try {
            const data = reportDataRef.current;
            const wb = XLSX.utils.book_new();

            if (activeTab === 'orders') {
                // Summary sheet
                const summaryData = [
                    ['Báo cáo đơn hàng', `Từ ${fromDate} đến ${toDate}`],
                    [],
                    ['Chỉ số', 'Giá trị'],
                    ['Tổng đơn hàng', data.summary?.totalOrders || 0],
                    ['Đơn hoàn thành', data.summary?.completedOrders || 0],
                    ['Đơn chờ xử lý', data.summary?.pendingOrders || 0],
                    ['Đơn đã hủy', data.summary?.cancelledOrders || 0],
                    ['Tổng doanh thu', data.summary?.totalRevenue || 0]
                ];
                const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

                // Recent orders sheet
                if (data.recentOrders?.length > 0) {
                    const ordersData = [
                        ['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Ngày đặt'],
                        ...data.recentOrders.map(o => [o.id, o.customer, o.total, o.status, o.date])
                    ];
                    const ws2 = XLSX.utils.aoa_to_sheet(ordersData);
                    XLSX.utils.book_append_sheet(wb, ws2, 'Chi tiết đơn hàng');
                }
            } else if (activeTab === 'products') {
                // Summary sheet
                const summaryData = [
                    ['Báo cáo sản phẩm', `Từ ${fromDate} đến ${toDate}`],
                    [],
                    ['Chỉ số', 'Giá trị'],
                    ['Tổng sản phẩm', data.summary?.totalProducts || 0],
                    ['Đang bán', data.summary?.activeProducts || 0],
                    ['Hết hàng', data.summary?.outOfStock || 0],
                    ['Ngừng kinh doanh', data.summary?.discontinued || 0],
                    ['Tổng đã bán', data.summary?.totalSold || 0]
                ];
                const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

                // Top selling sheet
                if (data.topSelling?.length > 0) {
                    const topData = [
                        ['Tên sản phẩm', 'Đã bán', 'Doanh thu'],
                        ...data.topSelling.map(p => [p.name, p.sold, p.revenue])
                    ];
                    const ws2 = XLSX.utils.aoa_to_sheet(topData);
                    XLSX.utils.book_append_sheet(wb, ws2, 'Top bán chạy');
                }
            } else if (activeTab === 'chatbot') {
                // Summary sheet
                const summaryData = [
                    ['Báo cáo Chatbot', `Từ ${fromDate} đến ${toDate}`],
                    [],
                    ['Chỉ số', 'Giá trị'],
                    ['Tổng cuộc hội thoại', data.summary?.totalConversations || 0],
                    ['Tổng tin nhắn', data.summary?.totalMessages || 0],
                    ['Thời gian phản hồi TB', data.summary?.avgResponseTime || ''],
                    ['Tỷ lệ hài lòng', data.summary?.satisfactionRate + '%' || '']
                ];
                const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

                // Top questions sheet
                if (data.topQuestions?.length > 0) {
                    const questionsData = [
                        ['Câu hỏi', 'Số lần hỏi'],
                        ...data.topQuestions.map(q => [q.question, q.count])
                    ];
                    const ws2 = XLSX.utils.aoa_to_sheet(questionsData);
                    XLSX.utils.book_append_sheet(wb, ws2, 'Top câu hỏi');
                }
            }

            XLSX.writeFile(wb, `bao-cao-${activeTab}-${fromDate}-${toDate}.xlsx`);
        } catch (error) {
            console.error('Export Excel error:', error);
            alert('Không thể xuất Excel. Vui lòng thử lại!');
        } finally {
            setExporting(false);
        }
    };

    const handleDataLoad = (data) => {
        reportDataRef.current = data;
    };

    return (
        <div className="report-page">
            {/* Header */}
            <div className="report-header">
                <h1><i className="bi bi-graph-up-arrow me-2"></i>Báo cáo thống kê</h1>
            </div>

            {/* Tabs */}
            <div className="report-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`report-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <i className={`bi ${tab.icon}`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="report-filters">
                <div className="filter-group">
                    <label>Từ ngày:</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label>Đến ngày:</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>
                <div className="filter-actions">
                    <button className="btn-filter primary" onClick={handleFilter}>
                        <i className="bi bi-funnel"></i>
                        Lọc
                    </button>
                    <button
                        className="btn-export pdf"
                        onClick={handleExportPDF}
                        disabled={exporting}
                    >
                        <i className="bi bi-file-earmark-pdf"></i>
                        {exporting ? 'Đang xuất...' : 'Xuất PDF'}
                    </button>
                    <button
                        className="btn-export excel"
                        onClick={handleExportExcel}
                        disabled={exporting}
                    >
                        <i className="bi bi-file-earmark-excel"></i>
                        {exporting ? 'Đang xuất...' : 'Xuất Excel'}
                    </button>
                </div>
            </div>

            {/* Report Content */}
            <div className="report-content" ref={reportRef}>
                {activeTab === 'orders' && (
                    <OrdersReport
                        fromDate={fromDate}
                        toDate={toDate}
                        filterTrigger={filterTrigger}
                        onDataLoad={handleDataLoad}
                    />
                )}
                {activeTab === 'products' && (
                    <ProductsReport
                        fromDate={fromDate}
                        toDate={toDate}
                        filterTrigger={filterTrigger}
                        onDataLoad={handleDataLoad}
                    />
                )}
                {activeTab === 'chatbot' && (
                    <ChatbotReport
                        fromDate={fromDate}
                        toDate={toDate}
                        filterTrigger={filterTrigger}
                        onDataLoad={handleDataLoad}
                    />
                )}
            </div>
        </div>
    );
}
