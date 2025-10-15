export default function Dashboard() {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h1 className="display-4">Admin Dashboard</h1>
          <p className="lead text-muted">Welcome to the admin panel</p>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <h5 className="card-title">Total Users</h5>
              <p className="card-text display-6">1,234</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <h5 className="card-title">Products</h5>
              <p className="card-text display-6">567</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white bg-warning mb-3">
            <div className="card-body">
              <h5 className="card-title">Orders</h5>
              <p className="card-text display-6">890</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white bg-danger mb-3">
            <div className="card-body">
              <h5 className="card-title">Revenue</h5>
              <p className="card-text display-6">$45K</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}