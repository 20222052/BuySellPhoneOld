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
import BrandService from "../../services/brandService";
import "../../assets/css/home/Home.css";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [brands, setBrands] = useState([]);
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
          status: "active", // Chỉ hiển thị sản phẩm đang bán
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

    const fetchBrands = async () => {
      try {
        const brandsData = await BrandService.getAll({ pageSize: 6 });
        console.log('Brands data:', brandsData);

        if (brandsData && brandsData.data && (brandsData.data.items || brandsData.data.content)) {
          const items = brandsData.data.items || brandsData.data.content;
          setBrands(items.slice(0, 6));
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchProducts();
    fetchBlogs();
    fetchBrands();
  }, []);



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
      <CategoriesSection brands={brands} />
      <FeaturedProducts products={featuredProducts} />
      <FeaturesSection features={features} />
      {/* <TradeInBanner /> */}
      {/* <VideoShortsSection videos={videos} /> */}
      <BlogSection blogs={blogs} />
      {/* <NewsletterSection /> */}
    </div>
  );
}
