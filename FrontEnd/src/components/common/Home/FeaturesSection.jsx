import { Container, Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";

export default function FeaturesSection({ features }) {
    return (
        <section className="features-section">
            <Container>
                <Row>
                    {features.map((feature, index) => (
                        <Col lg={3} md={6} key={index} className="mb-4">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className={feature.icon}></i>
                                </div>
                                <h5>{feature.title}</h5>
                                <p>{feature.desc}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}

FeaturesSection.propTypes = {
    features: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            desc: PropTypes.string.isRequired,
        })
    ).isRequired,
};
