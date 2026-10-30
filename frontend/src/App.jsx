
import { useEffect, useState } from "react";
import "./App.css";
import AdminDashboard from "./pages/AdminDashboard";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser"));
      return user?.role?.trim().toUpperCase() === "ADMIN"
        ? "admin"
        : "home";
    } catch {
      return "home";
    }
  });

  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Books",
    condition: "Good",
    imageUrl: "",
  });

  const [message, setMessage] = useState("");

  const isAdmin =
    currentUser?.role?.trim().toUpperCase() === "ADMIN";

  const loadProducts = () => {
    fetch(`${API}/products`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load products.");
        }
        return response.json();
      })
      .then((data) => setProducts(data))
      .catch((error) => console.error("Product loading error:", error));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      `${product.title} ${product.description}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      !category ||
      product.category?.toLowerCase() === category.toLowerCase();

    const matchesCondition =
      !condition ||
      product.condition?.toLowerCase() === condition.toLowerCase();

    const matchesPrice =
      !maxPrice || Number(product.price) <= Number(maxPrice);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesCondition &&
      matchesPrice
    );
  });

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setCondition("");
    setMaxPrice("");
  };

  const handleInput = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductInput = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value,
    });
  };

  const register = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: "BUYER",
        }),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (!response.ok) {
        setMessage(
          typeof data === "string" ? data : "Registration failed."
        );
        return;
      }

      setMessage("Registration successful. Please login.");
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
      });

      setPage("login");
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Unable to connect to server.");
    }
  };

  const login = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/users/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      console.log("Login response:", data);

      if (!response.ok) {
        setMessage(
          typeof data === "string" ? data : "Login failed."
        );
        return;
      }

      const role = String(data?.role || "")
        .trim()
        .toUpperCase();

      console.log("User role:", role);

      if (!role) {
        setMessage(
          "Login response did not include a user role. Please check the backend login response."
        );
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(data));
      setCurrentUser(data);

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
      });

      setMessage("");

      if (role === "ADMIN") {
        setPage("admin");
      } else {
        setPage("home");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to server.");
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setPage("home");
    setMessage("");
  };

  const resetProductForm = () => {
    setProductForm({
      title: "",
      description: "",
      price: "",
      category: "Books",
      condition: "Good",
      imageUrl: "",
    });

    setEditingProduct(null);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!currentUser) {
      setMessage("Please login first.");
      return;
    }

    const productData = {
      title: productForm.title,
      description: productForm.description,
      price: Number(productForm.price),
      category: productForm.category,
      condition: productForm.condition,
      imageUrl: productForm.imageUrl || null,
    };

    try {
      let url = `${API}/products?sellerId=${currentUser.id}`;
      let method = "POST";

      if (editingProduct) {
        url = `${API}/products/${editingProduct.id}?sellerId=${currentUser.id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (!response.ok) {
        setMessage(
          typeof data === "string" ? data : "Could not save product."
        );
        return;
      }

      resetProductForm();
      setMessage(
        editingProduct
          ? "Product updated successfully."
          : "Product added successfully."
      );

      loadProducts();
      setPage("my-products");
    } catch (error) {
      console.error("Save product error:", error);
      setMessage("Unable to connect to server.");
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);

    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      condition: product.condition,
      imageUrl: product.imageUrl || "",
    });

    setPage("add-product");
    setMessage("");
  };

  const deleteProduct = async (productId) => {
    if (!currentUser) return;

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/products/${productId}?sellerId=${currentUser.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.text();
        alert(data || "Could not delete product.");
        return;
      }

      loadProducts();
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Unable to connect to server.");
    }
  };

  const myProducts = products.filter(
    (product) => product.sellerId === currentUser?.id
  );

  return (
    <div className="app">
      <header className="navbar">
        <div
          className="logo"
          onClick={() => setPage("home")}
        >
          Campus Marketplace
        </div>

        <nav>
          <button onClick={() => setPage("home")}>Home</button>

          <button onClick={() => setPage("favorites")}>
            Favorites {favorites.length > 0 && `(${favorites.length})`}
          </button>

          {currentUser && !isAdmin && (
            <>
              <button onClick={() => setPage("my-products")}>
                My Products
              </button>

              <button
                onClick={() => {
                  resetProductForm();
                  setMessage("");
                  setPage("add-product");
                }}
              >
                + Sell Product
              </button>
            </>
          )}

          {isAdmin && (
            <button onClick={() => setPage("admin")}>
              Admin Dashboard
            </button>
          )}

          {currentUser ? (
            <button onClick={logout}>
              Logout ({currentUser.name})
            </button>
          ) : (
            <button
              onClick={() => {
                setMessage("");
                setPage("login");
              }}
            >
              Login
            </button>
          )}
        </nav>
      </header>

      {/* ADMIN DASHBOARD */}
      {page === "admin" && isAdmin && <AdminDashboard />}

      {/* HOME */}
      {page === "home" && (
        <main>
          <section className="hero">
            <h1>Campus Marketplace</h1>
            <p>Buy and sell products within your campus community.</p>

            
<div className="search-box">
  <button
    type="button"
    className="search-icon-button"
    aria-label="Focus search"
    onClick={() => document.getElementById("product-search")?.focus()}
  >
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </svg>
  </button>

  <input
    id="product-search"
    type="search"
    placeholder="Search books, electronics, notes..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("product-search")?.blur();
      }
    }}
  />
</div>

          </section>

          <section className="filters">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="Notes">Notes</option>
              <option value="Furniture">Furniture</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="">All Conditions</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>

            <input
              type="number"
              placeholder="Max price ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />

            <button className="clear-button" onClick={clearFilters}>
              Clear Filters
            </button>
          </section>

          <section className="products-section">
            <div className="section-header">
              <h2>Available Products</h2>
              <span>{filteredProducts.length} products</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try changing your search or filters.</p>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => {
                  const isFavorite = favorites.includes(product.id);

                  return (
                    <div className="product-card" key={product.id}>
                      <div className="card-image-container">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="product-image"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display =
                                  "flex";
                              }
                            }}
                          />
                        ) : null}

                        <div
                          className="image-placeholder"
                          style={{
                            display: product.imageUrl ? "none" : "flex",
                          }}
                        >
                          No Image
                        </div>

                        <button
                          className={`favorite-button ${
                            isFavorite ? "favorite-active" : ""
                          }`}
                          onClick={() => toggleFavorite(product.id)}
                        >
                          {isFavorite ? "♥" : "♡"}
                        </button>
                      </div>

                      <div className="product-content">
                        <h3>{product.title}</h3>
                        <p className="description">{product.description}</p>
                        <p className="price">₹{product.price}</p>

                        <div className="product-info">
                          <span>{product.category}</span>
                          <span>{product.condition}</span>
                        </div>

                        <button
                          className="details-button"
                          onClick={() => setSelectedProduct(product)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      )}

      {/* FAVORITES */}
      {page === "favorites" && (
        <main className="page-container">
          <h1>My Favorites</h1>

          {favorites.length === 0 ? (
            <div className="no-products">
              <h3>No favorites yet</h3>
              <p>Click the ♡ button on a product to save it.</p>
            </div>
          ) : (
            <div className="product-grid">
              {products
                .filter((product) => favorites.includes(product.id))
                .map((product) => (
                  <div className="product-card" key={product.id}>
                    <div className="image-placeholder">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="product-image"
                        />
                      ) : (
                        "No Image"
                      )}
                    </div>

                    <div className="product-content">
                      <h3>{product.title}</h3>
                      <p>{product.description}</p>
                      <p className="price">₹{product.price}</p>

                      <button
                        className="details-button"
                        onClick={() => setSelectedProduct(product)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </main>
      )}

      {/* LOGIN */}
      {page === "login" && (
        <main className="form-page">
          <form className="form-card" onSubmit={login}>
            <h1>Login</h1>

            {message && <div className="message">{message}</div>}

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleInput}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleInput}
              required
            />

            <button type="submit" className="primary-button">
              Login
            </button>

            <p>
              Don't have an account?{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setMessage("");
                  setPage("register");
                }}
              >
                Register
              </button>
            </p>
          </form>
        </main>
      )}

      {/* REGISTER */}
      {page === "register" && (
        <main className="form-page">
          <form className="form-card" onSubmit={register}>
            <h1>Create Account</h1>

            {message && <div className="message">{message}</div>}

            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleInput}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleInput}
              required
            />

            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleInput}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleInput}
              required
            />

            <button type="submit" className="primary-button">
              Register
            </button>

            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setMessage("");
                  setPage("login");
                }}
              >
                Login
              </button>
            </p>
          </form>
        </main>
      )}

      {/* ADD / EDIT PRODUCT */}
      {page === "add-product" && currentUser && !isAdmin && (
        <main className="form-page">
          <form className="form-card wide" onSubmit={saveProduct}>
            <h1>
              {editingProduct ? "Edit Product" : "Sell a Product"}
            </h1>

            {message && <div className="message">{message}</div>}

            <input
              name="title"
              placeholder="Product Title"
              value={productForm.title}
              onChange={handleProductInput}
              required
            />

            <textarea
              name="description"
              placeholder="Description"
              value={productForm.description}
              onChange={handleProductInput}
              required
            />

            <input
              name="price"
              type="number"
              placeholder="Price"
              min="0"
              value={productForm.price}
              onChange={handleProductInput}
              required
            />

            <select
              name="category"
              value={productForm.category}
              onChange={handleProductInput}
            >
              <option>Books</option>
              <option>Electronics</option>
              <option>Notes</option>
              <option>Furniture</option>
              <option>Other</option>
            </select>

            <select
              name="condition"
              value={productForm.condition}
              onChange={handleProductInput}
            >
              <option>New</option>
              <option>Like New</option>
              <option>Very Good</option>
              <option>Good</option>
              <option>Fair</option>
            </select>

            <input
              name="imageUrl"
              placeholder="Image URL (optional)"
              value={productForm.imageUrl}
              onChange={handleProductInput}
            />

            <button type="submit" className="primary-button">
              {editingProduct ? "Update Product" : "Add Product"}
            </button>

            {editingProduct && (
              <button
                type="button"
                className="cancel-button"
                onClick={resetProductForm}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </main>
      )}

      {/* MY PRODUCTS */}
      {page === "my-products" && currentUser && !isAdmin && (
        <main className="page-container">
          <div className="section-header">
            <h1>My Products</h1>

            <button
              className="primary-small-button"
              onClick={() => {
                resetProductForm();
                setMessage("");
                setPage("add-product");
              }}
            >
              + Add Product
            </button>
          </div>

          {myProducts.length === 0 ? (
            <div className="no-products">
              <h3>You haven't listed anything yet.</h3>
            </div>
          ) : (
            <div className="product-grid">
              {myProducts.map((product) => (
                <div className="product-card" key={product.id}>
                  <div className="image-placeholder">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="product-image"
                      />
                    ) : (
                      "No Image"
                    )}
                  </div>

                  <div className="product-content">
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>
                    <p className="price">₹{product.price}</p>

                    <div className="product-actions">
                      <button
                        className="edit-button"
                        onClick={() => editProduct(product)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </button>

            {selectedProduct.imageUrl && (
              <img
                src={selectedProduct.imageUrl}
                alt=""
                className="modal-image"
              />
            )}

            <h2>{selectedProduct.title}</h2>

            <p className="modal-description">
              {selectedProduct.description}
            </p>

            <p className="modal-price">₹{selectedProduct.price}</p>

            <p>
              <strong>Category:</strong> {selectedProduct.category}
            </p>

            <p>
              <strong>Condition:</strong> {selectedProduct.condition}
            </p>

            <hr />

            <h3>Seller Information</h3>

            <p>
              <strong>Name:</strong> {selectedProduct.sellerName}
            </p>

            <p>
              <strong>Email:</strong> {selectedProduct.sellerEmail}
            </p>

            <p>
              <strong>Phone:</strong> {selectedProduct.sellerPhone}
            </p>

            <button
              className="contact-button"
              onClick={() => {
                if (selectedProduct.sellerEmail) {
                  window.location.href =
                    `mailto:${selectedProduct.sellerEmail}`;
                }
              }}
            >
              Contact Seller
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
