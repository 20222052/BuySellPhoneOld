import HeroSection from "../../components/common/Home/HeroSection";
import CategoriesSection from "../../components/common/Home/CategoriesSection";
import FeaturedProducts from "../../components/common/Home/FeaturedProducts";
import FeaturesSection from "../../components/common/Home/FeaturesSection";
import TradeInBanner from "../../components/common/Home/TradeInBanner";
import BlogSection from "../../components/common/Home/BlogSection";
import NewsletterSection from "../../components/common/Home/NewsletterSection";
import VideoShortsSection from "../../components/common/Home/VideoShortsSection";
import "../../assets/css/home/Home.css";


export default function Home() {
  const featuredProducts = [
    {
      id: 1,
      name: "iPhone 13 Pro Max",
      price: "18.990.000",
      oldPrice: "25.990.000",
      image:
        "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
      condition: "A",
      badge: "Hot",
    },
    {
      id: 2,
      name: "Samsung Galaxy S23 Ultra",
      price: "16.990.000",
      oldPrice: "22.990.000",
      image:
        "https://cdn.tgdd.vn/Products/Images/42/249948/samsung-galaxy-s23-ultra-green-thumbnew-600x600.jpg",
      condition: "A",
      badge: "Sale",
    },
    {
      id: 3,
      name: "iPhone 14 Pro",
      price: "22.990.000",
      oldPrice: "28.990.000",
      image:
        "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
      condition: "A",
      badge: "New",
    },
    {
      id: 4,
      name: "Xiaomi 13 Pro",
      price: "12.990.000",
      oldPrice: "16.990.000",
      image:
        "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
      condition: "A",
      badge: "Hot",
    },
    {
      id: 5,
      name: "OPPO Find X5 Pro",
      price: "14.990.000",
      oldPrice: "19.990.000",
      image:
        "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
      condition: "A",
      badge: "Sale",
    },
    {
      id: 6,
      name: "Vivo V27 Pro",
      price: "9.990.000",
      oldPrice: "12.990.000",
      image:
        "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
      condition: "A",
      badge: "New",
    },
    {
      id: 7,
      name: "Samsung Galaxy Z Fold 4",
      price: "24.990.000",
      oldPrice: "32.990.000",
      image:
        "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
      condition: "B",
      badge: "Hot",
    },
    {
      id: 8,
      name: "iPhone 12 Pro Max",
      price: "15.990.000",
      oldPrice: "20.990.000",
      image:
        "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
      condition: "A",
      badge: "Sale",
    },
  ];

  const categories = [
    { name: "iPhone", icon: "bi-apple", count: 150, color: "#000000" },
    { name: "Samsung", icon: "bi-phone", count: 200, color: "#1428A0" },
    { name: "Xiaomi", icon: "bi-phone", count: 120, color: "#FF6900" },
    { name: "OPPO", icon: "bi-phone", count: 90, color: "#00B050" },
    { name: "Vivo", icon: "bi-phone", count: 80, color: "#0066FF" },
    { name: "Realme", icon: "bi-phone", count: 60, color: "#FFD700" },
  ];

  const features = [
    {
      icon: "bi-shield-check",
      title: "Đảm Bảo Chất Lượng",
      desc: "Sản phẩm được kiểm tra kỹ càng",
    },
    {
      icon: "bi-arrow-repeat",
      title: "Đổi Trả 7 Ngày",
      desc: "Miễn phí đổi trả trong 7 ngày",
    },
    {
      icon: "bi-tools",
      title: "Bảo Hành Uy Tín",
      desc: "Bảo hành chính hãng lên đến 12 tháng",
    },
    {
      icon: "bi-truck",
      title: "Giao Hàng Nhanh",
      desc: "Giao hàng toàn quốc trong 24h",
    },
  ];

  const blogs = [
    {
      id: 1,
      title: "Top 5 điện thoại cũ đáng mua nhất tháng 11/2025",
      excerpt:
        "Khám phá những chiếc điện thoại cũ có giá tốt nhất trong tháng với hiệu năng vượt trội...",
      image:
        "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
      date: "13/11/2025",
      views: "1.2K",
    },
    {
      id: 2,
      title: "Hướng dẫn kiểm tra điện thoại cũ trước khi mua",
      excerpt:
        "Những bước cơ bản để kiểm tra máy cũ tránh mua phải hàng lỗi, hàng dựng...",
      image:
        "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
      date: "12/11/2025",
      views: "2.5K",
    },
    {
      id: 3,
      title: "So sánh iPhone 13 vs iPhone 14: Nên chọn máy nào?",
      excerpt:
        "Phân tích chi tiết sự khác biệt giữa iPhone 13 và iPhone 14 để đưa ra lựa chọn phù hợp...",
      image:
        "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
      date: "11/11/2025",
      views: "3.8K",
    },
  ];

  const stats = [
    { value: "10K+", label: "Sản phẩm" },
    { value: "50K+", label: "Khách hàng" },
    { value: "99%", label: "Hài lòng" },
  ];

  const videos = [
    {
      url: "https://www.youtube.com/embed/eWCepCi7aEg?si=0R7sDJm-51Fd8mNB",
      title: "Review iPhone 15 Pro Max",
      description: "Đánh giá chi tiết về iPhone 15 Pro Max - Có nên mua máy cũ?",
    },
    {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      title: "Samsung Galaxy S24 Ultra",
      description: "Trải nghiệm Galaxy S24 Ultra sau 1 tháng sử dụng",
    },
    {
      url: "https://www.youtube.com/embed/jNQXAC9IVRw",
      title: "Top 5 Điện Thoại Cũ",
      description: "5 chiếc điện thoại cũ đáng mua nhất hiện nay",
    },
    {
      url: "https://www.youtube.com/embed/kJQP7kiw5Fk",
      title: "Hướng Dẫn Kiểm Tra Máy Cũ",
      description: "Cách kiểm tra điện thoại cũ tránh mua phải hàng dựng",
    },
    {
      url: "https://www.youtube.com/embed/M7lc1UVf-VE",
      title: "Xiaomi 14 Pro",
      description: "Liệu Xiaomi 14 Pro có xứng đáng với mức giá hiện tại?",
    },
    {
      url: "https://www.youtube.com/embed/YQHsXMglC9A",
      title: "So Sánh iPhone vs Android",
      description: "Nên chọn iPhone hay Android trong tầm giá dưới 10 triệu",
    },
  ];

  return (
    <div className="home-page">
      <HeroSection stats={stats} />
      <CategoriesSection categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <FeaturesSection features={features} />
      <TradeInBanner />
      {/* <VideoShortsSection videos={videos} /> */}
      <BlogSection blogs={blogs} />
      {/* <NewsletterSection /> */}
    </div>
  );
}
