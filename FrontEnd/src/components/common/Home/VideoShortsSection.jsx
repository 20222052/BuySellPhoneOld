import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "./VideoShortsSection.css";

export default function VideoShortsSection({ videos }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slidesToShow, setSlidesToShow] = useState(4);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 576) {
                setSlidesToShow(1);
            } else if (window.innerWidth < 768) {
                setSlidesToShow(2);
            } else if (window.innerWidth < 992) {
                setSlidesToShow(3);
            } else {
                setSlidesToShow(3);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => {
            const maxIndex = videos.length - slidesToShow;
            return prev >= maxIndex ? 0 : prev + 1;
        });
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => {
            const maxIndex = videos.length - slidesToShow;
            return prev <= 0 ? maxIndex : prev - 1;
        });
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    return (
        <section className="video-shorts-section">
            <div className="container">
                <div className="section-header text-center mb-5">
                    <h2 className="section-title">Video Shorts</h2>
                    <p className="section-subtitle">
                        Khám phá những video ngắn về sản phẩm và tin tức công nghệ
                    </p>
                </div>

                <div className="carousel-container">
                    <button
                        className="carousel-btn carousel-btn-prev"
                        onClick={prevSlide}
                        aria-label="Previous slide"
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>

                    <div className="carousel-wrapper">
                        <div
                            className="carousel-track"
                            style={{
                                transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`
                            }}
                        >
                            {videos.map((video, index) => (
                                <div
                                    key={index}
                                    className="carousel-slide"
                                    style={{ flex: `0 0 ${100 / slidesToShow}%` }}
                                >
                                    <div className="video-card">
                                        <div className="video-wrapper">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={video.url}
                                                title={video.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                referrerPolicy="strict-origin-when-cross-origin"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                        {/* {video.title && (
                                            <div className="video-info">
                                                <h4 className="video-title">{video.title}</h4>
                                                {video.description && (
                                                    <p className="video-description">{video.description}</p>
                                                )}
                                            </div>
                                        )} */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className="carousel-btn carousel-btn-next"
                        onClick={nextSlide}
                        aria-label="Next slide"
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </div>

                <div className="carousel-dots">
                    {Array.from({ length: videos.length - slidesToShow + 1 }).map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${currentIndex === index ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        ></button>
                    ))}
                </div>
            </div>
        </section>
    );
}

VideoShortsSection.propTypes = {
    videos: PropTypes.arrayOf(
        PropTypes.shape({
            url: PropTypes.string.isRequired,
            title: PropTypes.string,
            description: PropTypes.string,
        })
    ).isRequired,
};
