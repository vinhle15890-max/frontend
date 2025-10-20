class Product {
  constructor(id, name, price, image, category, description, hot = false) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.image = image;
    this.category = category;
    this.description = description;
    this.hot = hot;
  }

  // Hàm hiển thị 1 sản phẩm dạng hàng trong bảng
  renderRow() {
    return `
      <tr>
        <td>${this.id}</td>
        <td><img src="${this.image}" alt="${this.name}" width="60"></td>
        <td>${this.name}</td>
        <td>${Number(this.price).toLocaleString("vi-VN")} ₫</td>
        <td>${this.category || ""}</td>
        <td>${this.description || ""}</td>
        <td class="action-btns">
          <button class="btn-edit" data-id="${this.id}">Sửa</button>
          <button class="btn-delete" data-id="${this.id}">Xóa</button>
        </td>
      </tr>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const productsList = document.getElementById("admin-product-list");
  const openAddProductModal = document.getElementById("openAddProductModal");
  const productModal = document.getElementById("product-modal");
  const productForm = document.getElementById("product-form");
  const imageInput = document.getElementById("product-image");
  const previewImg = document.getElementById("preview-image");
  let imageBase64 = "";

  // ===== Hiển thị danh sách sản phẩm =====
  const loadProducts = async () => {
    try {
      const res = await fetch("http://localhost:3000/products");
      const data = await res.json();
      productsList.innerHTML = data
        .map(p => new Product(p.id, p.name, p.price, p.image, p.category, p.description, p.hot).renderRow())
        .join("");
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    }
  };

  loadProducts();

  // ===== Mở modal =====
  openAddProductModal.addEventListener("click", () => {
    productModal.style.display = "flex";
  });

  // ===== Preview ảnh =====
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        imageBase64 = e.target.result;
        previewImg.src = imageBase64;
        previewImg.style.display = "block";
        previewImg.style.maxWidth = "100%";
        previewImg.style.maxHeight = "150px";
        previewImg.style.objectFit = "cover";
        previewImg.style.marginBottom = "10px";
      };
      reader.readAsDataURL(file);
    }
  });

  // ===== Lưu sản phẩm =====
  productForm.addEventListener("submit", async e => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/products");
      const products = await res.json();

      const maxId = products.length > 0
        ? Math.max(...products.map(p => parseInt(p.id) || 0))
        : 0;

      const newProduct = new Product(
        (maxId + 1).toString(),
        document.getElementById("product-name").value,
        parseFloat(document.getElementById("product-price").value),
        imageBase64,
        document.getElementById("product-category").value,
        document.getElementById("product-description").value,
        document.getElementById("product-hot").checked
      );

      const postRes = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });

      if (postRes.ok) {
        alert("✅ Thêm sản phẩm thành công!");
        productForm.reset();
        previewImg.style.display = "none";
        imageBase64 = "";
        productModal.style.display = "none";
        loadProducts();
      } else {
        alert("❌ Lỗi khi thêm sản phẩm!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  });

  // ===== Đóng modal khi click nền đen =====
  productModal.addEventListener("click", e => {
    if (e.target === productModal) productModal.style.display = "none";
  });
});
