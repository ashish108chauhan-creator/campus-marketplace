
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
  });

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  async function loadStats() {
    const response = await fetch(`${API}/admin/stats`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Could not load dashboard (${response.status})`);
    }

    setStats(await response.json());
  }

  async function loadUsers() {
    setUsersLoading(true);

    try {
      const response = await fetch(`${API}/admin/users`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not load users.");
      }

      setUsers(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadProducts() {
    setProductsLoading(true);

    try {
      const response = await fetch(`${API}/admin/products`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not load products.");
      }

      setProducts(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setProductsLoading(false);
    }
  }

  async function refreshDashboard() {
    setError("");

    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadProducts(),
      ]);
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshDashboard();
  }, []);

  async function deleteUser(user) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name} (${user.email})? Their products will also be removed.`
    );

    if (!confirmed) return;

    setError("");
    setActionMessage("");

    try {
      const response = await fetch(
        `${API}/admin/users/${user.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Could not delete user.");
      }

      setActionMessage("User deleted successfully.");
      await refreshDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${product.title}" from the marketplace?`
    );

    if (!confirmed) return;

    setError("");
    setActionMessage("");

    try {
      const response = await fetch(
        `${API}/admin/products/${product.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Could not remove product.");
      }

      setActionMessage("Product removed successfully.");
      await refreshDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <span className="admin-eyebrow">CAMPUS MARKETPLACE</span>
          <h1>Admin Dashboard</h1>
          <p>
            Welcome back! Here's an overview of your campus marketplace.
          </p>
        </div>

        <div className="admin-hero-icon">✦</div>
      </section>

      {error && <div className="admin-error">{error}</div>}

      {actionMessage && (
        <div className="admin-success">{actionMessage}</div>
      )}

      <section className="admin-section-heading">
        <div>
          <h2>Platform Overview</h2>
          <p>Track users and products across your platform.</p>
        </div>

        <span className="admin-live-label">
          <span className="admin-live-dot" />
          Dashboard
        </span>
      </section>

      <section className="admin-stats-grid">
        <article className="admin-stat-card users-card">
          <div className="admin-stat-top">
            <div className="admin-stat-icon">♙</div>
            <span className="admin-stat-tag">COMMUNITY</span>
          </div>

          <p className="admin-stat-label">Total Users</p>
          <h3>{loading ? "..." : stats.totalUsers}</h3>
          <p className="admin-stat-description">
            Registered marketplace members
          </p>

          <div className="admin-stat-bottom">
            <span>♙</span> Your campus community
          </div>
        </article>

        <article className="admin-stat-card products-card">
          <div className="admin-stat-top">
            <div className="admin-stat-icon">▧</div>
            <span className="admin-stat-tag">MARKETPLACE</span>
          </div>

          <p className="admin-stat-label">Total Products</p>
          <h3>{loading ? "..." : stats.totalProducts}</h3>
          <p className="admin-stat-description">
            Products listed on the platform
          </p>

          <div className="admin-stat-bottom">
            <span>▧</span> Campus listings
          </div>
        </article>
      </section>

      <section className="admin-welcome-card">
        <div className="admin-welcome-symbol">✧</div>
        <div>
          <h2>One campus. One marketplace.</h2>
          <p>
            Keep an eye on your community and help students buy, sell,
            and discover useful things around campus.
          </p>
        </div>
      </section>

      {/* ADMIN MANAGEMENT */}

      <section className="admin-management">
        <div className="admin-section-heading">
          <div>
            <h2>Marketplace Management</h2>
            <p>Manage registered members and moderate listings.</p>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            ♙ User Management ({users.length})
          </button>

          <button
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            ▧ Product Moderation ({products.length})
          </button>
        </div>

        {activeTab === "users" && (
          <div className="admin-table-container">
            <div className="admin-table-heading">
              <div>
                <h3>Registered Users</h3>
                <p>View and manage marketplace accounts.</p>
              </div>

              <button onClick={loadUsers} className="admin-refresh-button">
                ↻ Refresh
              </button>
            </div>

            {usersLoading ? (
              <p className="admin-empty">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="admin-empty">No users found.</p>
            ) : (
              <div className="admin-responsive-table">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>#{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone || "—"}</td>
                        <td>
                          <span className="admin-role">
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {user.role?.toUpperCase() === "ADMIN" ? (
                            <span className="admin-protected">
                              Protected
                            </span>
                          ) : (
                            <button
                              className="admin-delete-button"
                              onClick={() => deleteUser(user)}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div className="admin-table-container">
            <div className="admin-table-heading">
              <div>
                <h3>Marketplace Listings</h3>
                <p>Review and remove inappropriate listings.</p>
              </div>

              <button
                onClick={loadProducts}
                className="admin-refresh-button"
              >
                ↻ Refresh
              </button>
            </div>

            {productsLoading ? (
              <p className="admin-empty">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="admin-empty">No products found.</p>
            ) : (
              <div className="admin-responsive-table">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Seller</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>#{product.id}</td>
                        <td>
                          <div className="admin-product-cell">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                              />
                            )}
                            <span>{product.title}</span>
                          </div>
                        </td>
                        <td>{product.category || "—"}</td>
                        <td>
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        </td>
                        <td>
                          <div>
                            <strong>{product.sellerName}</strong>
                            <small>{product.sellerEmail}</small>
                          </div>
                        </td>
                        <td>
                          <button
                            className="admin-delete-button"
                            onClick={() => deleteProduct(product)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="admin-footer">
        <span>Campus Marketplace</span>
        <span>Administration Panel · Made for students</span>
      </footer>
    </main>
  );
}
