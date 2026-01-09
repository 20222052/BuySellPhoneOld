import { Pagination } from "react-bootstrap";
import "../../assets/css/home/Products/PaginationCustom.css";
import PropTypes from "prop-types";

export default function PaginationCustom({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
    return (
        <div className="d-flex justify-content-center mt-4">
            <Pagination className="custom-pagination">
                <Pagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
                {/* Hiển thị tối đa 3 số trang quanh trang hiện tại */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNum =>
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    )
                    .map((pageNum, idx, arr) => [
                        idx > 0 && pageNum - arr[idx - 1] > 1 ? (
                            <Pagination.Ellipsis key={`ellipsis-${pageNum}`} disabled />
                        ) : null,
                        <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => onPageChange(pageNum)}
                        >
                            {pageNum}
                        </Pagination.Item>
                    ]).flat()
                }
                <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
        </div>
    );
}

PaginationCustom.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};
