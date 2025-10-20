  // class sản phẩm
  class Product {
    constructor(id, name, price, image, category, hot, description) {
      this.id = id;
      this.name = name;
      this.price = price;
      this.image = image;
      this.category = category;
      this.hot = hot;
      this.description = description;
    }

    render() {
      return `
        <div class="product">
          <img src="${this.image}">
          <a href="detail.html?id=${this.id}"><h4>${this.name}</h4></a>
          <p>Giá: ${Number(this.price).toLocaleString('vi-VN')} ₫</p>
        </div>
      `;
    }

     renderDetail() {
    const imgSrc = this.image && this.image.trim() !== "" 
      ? this.image 
      : "images/no-image.png"; // fallback nếu thiếu ảnh

    return `
      <section id="product-detail">
        <img src="${imgSrc}" alt="${this.name}">
        <div class="product-info">
          <h2>${this.name}</h2>
          <p class="price">${Number(this.price).toLocaleString('vi-VN')} ₫</p>
          <p><strong>Danh mục:</strong> ${this.category}</p>
          <p><strong>Mô tả:</strong> ${this.description}</p>
          <button id="addCartBtn" productId="${this.id}">🛒 Thêm vào giỏ hàng</button>
        </div>
      </section>
    `;
  }
  }

  // Hàm hiển thị danh sách sản phẩm theo mảng
  function showProducts(data, container) {
    let html = "";
    data.forEach((item) => {
      const product = new Product(
        item.id,
        item.name,
        item.price,
        item.image,
        item.category,
        item.hot,
        item.description
      );
      html += product.render();
    });
    container.innerHTML = html;
  }

  //show trang chủ
  const productHot = document.getElementById("product-hot");
  const productLaptop = document.getElementById("product-laptop");
  const productDienThoai = document.getElementById("product-dienthoai");

  if (productHot) {
    fetch(`https://my-json-server.typicode.com/vinhle15890-max/backend/products`)
      .then((response) => response.json())
      .then((data) => {
        const dataHot = data.filter((p) => p.hot === true);
        const dataLaptop = data.filter((p) => p.category === "laptop");
        const dataPhone = data.filter((p) => p.category === "điện thoại");

        showProducts(dataHot, productHot);
        showProducts(dataLaptop, productLaptop);
        showProducts(dataPhone, productDienThoai);
      })
      .catch((err) => console.error("Lỗi fetch API:", err));
  }

  // Show trang sản phẩm
  const productAll = document.getElementById('all-product');
  const searchInput = document.getElementById('search-input');
  const sortPrice = document.getElementById('sort-price');

  let allProductsData = [];
  let filteredProducts = [];

  if (productAll) {
    fetch(`https://my-json-server.typicode.com/vinhle15890-max/backend/products`)
      .then(response => response.json())
      .then(data => {
        allProductsData = data;
        filteredProducts = data;
        renderProduct(allProductsData, productAll);
      });
  }

  // ====== Tìm kiếm ======
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      filteredProducts = allProductsData.filter(
        p => p.name.toLowerCase().includes(keyword)
      );
      renderProduct(filteredProducts, productAll);
    });
  }

  // ====== Sắp xếp ======
  if (sortPrice) {
    sortPrice.addEventListener('change', (e) => {
      let sorted = [...filteredProducts];
      if (e.target.value === "asc") {
        sorted.sort((a, b) => a.price - b.price);
      } else if (e.target.value === 'desc') {
        sorted.sort((a, b) => b.price - a.price);
      }
      renderProduct(sorted, productAll);
    });
  }

  // ====== Hàm render chung ======
  const renderProduct = (array, theDiv) => {
    let html = "";
    array.forEach((item) => {
      const product = new Product(
        item.id,
        item.name,
        item.price,
        item.image,
        item.category,
        item.hot,
        item.description
      );
      html += product.render();
    });
    theDiv.innerHTML = html;
  };

  // Show chi tiết sản phẩm
  const productDetailDiv = document.getElementById('product-detail');
  if (productDetailDiv) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    fetch(`https://my-json-server.typicode.com/vinhle15890-max/backend/products/${id}`)
      .then(response => response.json())
      .then(item => {
        const product = new Product(
          item.id,
          item.name,
          item.price,
          item.image,
          item.category,
          item.hot,
          item.description
        );
        productDetailDiv.innerHTML = product.renderDetail();
      });
  }

  // ================== CLASS CART ==================
  class Cart {
    constructor() {
      this.items = JSON.parse(localStorage.getItem("cart")) || [];
    }

    saveToLocalStorage() {
      localStorage.setItem("cart", JSON.stringify(this.items));
    }

    addItem(product) {
      const existingItem = this.items.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        });
      }
      this.saveToLocalStorage();
    }

    removeItem(id) {
      this.items = this.items.filter((item) => item.id != id);
      this.saveToLocalStorage();
    }

    updateQuantity(id, newQuantity) {
      const item = this.items.find((item) => item.id == id);
      if (item) {
        if (newQuantity <= 0) {
          this.removeItem(id);
        } else {
          item.quantity = newQuantity;
        }
        this.saveToLocalStorage();
      }
    }

    getQuantity(id) {
      const item = this.items.find((i) => i.id == id);
      return item ? item.quantity : 0;
    }

    getTotal() {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    render(container) {
      if (this.items.length === 0) {
        container.innerHTML = "<p>Giỏ hàng trống 😢</p>";
        return;
      }

      let html = `
        <h3>🛒 Giỏ hàng của bạn</h3>
        <table class="cart-table">
          <thead>
            <tr>
              <th>Hình</th>
              <th>Sản phẩm</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
      `;

      this.items.forEach((item) => {
        html += `
          <tr>
            <td><img src="${item.image}" width="60"></td>
            <td>${item.name}</td>
            <td class="price">${Number(item.price).toLocaleString('vi-VN')} ₫</td>
            <td>
              <button class="decrease" data-id="${item.id}">-</button>
              <span>${item.quantity}</span>
              <button class="increase" data-id="${item.id}">+</button>
            </td>
            <td class="price">${Number(item.price * item.quantity).toLocaleString('vi-VN')} ₫</td>
            <td><button class="delete" data-id="${item.id}">Xóa</button></td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
        <div class="cart-total">
          <h3>Tổng cộng: <span>${Number(this.getTotal()).toLocaleString('vi-VN')} ₫</span></h3>
          <button id="clear-cart">🧹 Xóa toàn bộ giỏ hàng</button>
        </div>
      `;
      container.innerHTML = html;

      container.querySelectorAll(".increase").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const id = e.target.dataset.id;
          this.updateQuantity(id, this.getQuantity(id) + 1);
          this.render(container);
        })
      );

      container.querySelectorAll(".decrease").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const id = e.target.dataset.id;
          this.updateQuantity(id, this.getQuantity(id) - 1);
          this.render(container);
        })
      );

      container.querySelectorAll(".delete").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const id = e.target.dataset.id;
          this.removeItem(id);
          this.render(container);
        })
      );

      const clearBtn = document.getElementById("clear-cart");
      clearBtn.addEventListener("click", () => {
        if (confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng không?")) {
          this.items = [];
          this.saveToLocalStorage();
          this.render(container);
        }
      });
    }
  }

  const cart = new Cart();

  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "addCartBtn") {
      const productId = e.target.getAttribute("productId");
      fetch(`https://my-json-server.typicode.com/vinhle15890-max/backend/products/${productId}`)
        .then((response) => response.json())
        .then((item) => {
          const product = new Product(
            item.id,
            item.name,
            item.price,
            item.image,
            item.category,
            item.hot,
            item.description
          );
          cart.addItem(product);
          alert("Đã thêm vào giỏ hàng!");
          const cartLink = document.querySelector('header nav a[href="cart.html"]');
          if (cartLink) {
            cartLink.textContent = `Giỏ hàng (${cart.items.length})`;
          }
        });
    }
  });

  const cartPage = document.getElementById("cart-page");
  if (cartPage) {
    cart.render(cartPage);
  }

  const header = document.createElement('header');
  header.innerHTML = `
    <div class="logo">Vinh Shop</div>
    <nav>
      <a href="index.html">Trang chủ</a>
      <a href="product.html">Sản phẩm</a>
      <a href="about.html">Giới thiệu</a>
      <a href="contact.html">Liên hệ</a>
      <a href="contact.html">Đăng nhập</a>
      <a href="contact.html">Đăng ký</a>
      <a href="cart.html" class="cart-icon">
        🛒
        <span class="cart-count">${cart.items.reduce((sum, i) => sum + i.quantity, 0)}</span>
      </a>
    </nav>
    <div class="search-box">
      <input type="text" placeholder="Tìm kiếm...">
      <button>🔍</button>
    </div>
  `;
  document.body.prepend(header);

  const footer = document.createElement('footer');
  footer.innerHTML = `
    <div class="footer-container">
      <div class="footer-col">
        <h3>MyShop</h3>
        <p>MyShop mang đến sản phẩm công nghệ mới nhất, chính hãng và giá tốt nhất.</p>
      </div>
      <div class="footer-col">
        <h4>Danh mục</h4>
        <ul>
          <li><a href="#">Điện thoại</a></li>
          <li><a href="#">Laptop</a></li>
          <li><a href="#">Nổi bật</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Liên hệ</h4>
        <p>Email: support@myshop.com</p>
        <p>Hotline: 0123 456 789</p>
      </div>
    </div>
    <div class="footer-bottom">© 2025 MyShop | Thiết kế bởi Vinh 🐝</div>
  `;
  document.body.appendChild(footer);

