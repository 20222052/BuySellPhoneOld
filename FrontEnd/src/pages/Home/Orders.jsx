import { Container, Card, Table } from "react-bootstrap";
export default function Orders() {
    return (
        <Container className="py-4">
            <Card className="p-4 border-0 shadow-sm">
                <h2 className="mb-3 text-center"><i className="bi bi-receipt"></i> Đơn hàng của bạn</h2>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Ngày đặt</th>
                            <th>Trạng thái</th>
                            <th>Tổng tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>#12345</td>
                            <td>25/12/2025</td>
                            <td><span className="text-success">Đã giao</span></td>
                            <td>15.490.000₫</td>
                        </tr>
                        <tr>
                            <td>#12346</td>
                            <td>20/12/2025</td>
                            <td><span className="text-warning">Đang xử lý</span></td>
                            <td>12.990.000₫</td>
                        </tr>
                    </tbody>
                </Table>
            </Card>
        </Container>
    );
}
