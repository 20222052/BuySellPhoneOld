import { useState, useEffect } from "react";
import HeroSection from "../../components/common/Home/HeroSection";
import CategoriesSection from "../../components/common/Home/CategoriesSection";
import FeaturedProducts from "../../components/common/Home/FeaturedProducts";
import FeaturesSection from "../../components/common/Home/FeaturesSection";
import TradeInBanner from "../../components/common/Home/TradeInBanner";
import BlogSection from "../../components/common/Home/BlogSection";
import NewsletterSection from "../../components/common/Home/NewsletterSection";
import VideoShortsSection from "../../components/common/Home/VideoShortsSection";
import ProductItemService from "../../services/productItemService";
import BlogService from "../../services/blogService";
import "../../assets/css/home/Home.css";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch featured products
        const productsData = await ProductItemService.getAllForList({
          pageSize: 8,
          sortDir: "DESC",
          sortBy: "createdAt",
        });
        console.log(productsData);

        // Map product data
        if (productsData && productsData.data && (productsData.data.items || productsData.data.content)) {
          const items = productsData.data.items || productsData.data.content;
          setFeaturedProducts(items);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBlogs = async () => {
      try {
        // Fetch blogs
        const blogsData = await BlogService.getPublicList({ pageSize: 3 });
        console.log(blogsData);

        // Map blog data
        if (blogsData && blogsData.data && (blogsData.data.items || blogsData.data.content)) {
          const items = blogsData.data.items || blogsData.data.content;

          const stripHtml = (html) => {
            if (!html) return "";
            const doc = new DOMParser().parseFromString(html, "text/html");
            return doc.body.textContent || "";
          };

          const mappedBlogs = items.map((b) => ({
            id: b.id,
            title: b.title,
            excerpt: stripHtml(b.excerpt || b.content).substring(0, 100) + "...",
            image: b.imageUrl || "https://via.placeholder.com/600",
            date: b.createdAt ? new Date(b.createdAt).toLocaleDateString("vi-VN") : "",
            views: b.viewCount || "0",
          }));
          setBlogs(mappedBlogs);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchProducts();
    fetchBlogs();
  }, []);

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

  const stats = [
    { value: "10K+", label: "Sản phẩm" },
    { value: "50K+", label: "Khách hàng" },
    { value: "99%", label: "Hài lòng" },
  ];

  return (
    <div className="home-page">
      <HeroSection stats={stats} />
      <CategoriesSection categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <FeaturesSection features={features} />
      {/* <TradeInBanner /> */}
      {/* <VideoShortsSection videos={videos} /> */}
      <BlogSection blogs={blogs} />
      {/* <NewsletterSection /> */}
    </div>
  );
}
