import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// D:\DONGA\nam4\DATN\buysellphoneold\FrontEnd\src\assets\css\home\HeroSection.css
import "../../../assets/css/home/HeroSection.css";

export default function HeroSection() {
    return (
        <section className="hero-section">
            <Container fluid className="p-0">
                <Swiper
                    spaceBetween={0}
                    centeredSlides={true}
                    autoplay={{
                        delay: 3500,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    navigation={true}
                    modules={[Autoplay, Pagination, Navigation]}
                    className="mySwiper"
                    loop={true}
                >
                    {/* Slide 1 */}
                    <SwiperSlide>
                        <div className="w-100">
                            <img
                                src="https://shopdunk.com/images/uploaded/banner/banner%202026/tha%CC%81ng%201/home%20page/banner%20iP17pro-a_Danh%20m%E1%BB%A5c.png"
                                alt="iPhone 17 Pro Banner"
                                className="w-100 h-100 object-fit-cover"
                                style={{ borderRadius: '20px' }}
                            />
                        </div>
                    </SwiperSlide>

                    {/* Slide 2 */}
                    <SwiperSlide>
                        <div className="w-100">
                            <img
                                src="https://shopdunk.com/images/uploaded/banner/banner%202026/tha%CC%81ng%201/home%20page/banner%20iP17-a_Danh%20m%E1%BB%A5c.png"
                                alt="iPhone 17 Banner"
                                className="w-100 h-100 object-fit-cover"
                                style={{ borderRadius: '20px' }}
                            />
                        </div>
                    </SwiperSlide>

                    {/* Slide 3: Handling the potentially incorrect link */}
                    <SwiperSlide>
                        <div className="w-100">
                            <img
                                src="https://shopdunk.com/dien-thoai-iphone-17-pro-max-256gb"
                                alt="iPhone 17 Pro Max 256GB"
                                className="w-100 h-100 object-fit-cover"
                                style={{ borderRadius: '20px' }}
                                onError={(e) => {
                                    // Fallback if the link is not an image (which it likely isn't)
                                    e.target.src = "https://shopdunk.com/images/uploaded/banner/banner%202026/tha%CC%81ng%201/home%20page/banner%20iP17pro-a_Danh%20m%E1%BB%A5c.png";
                                }}
                            />
                        </div>
                    </SwiperSlide>
                </Swiper>
            </Container>
        </section>
    );
}
