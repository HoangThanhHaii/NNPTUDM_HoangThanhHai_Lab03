const API_URL = "https://api.escuelajs.co/api/v1/products";

let products = [];
let currentPage = 1;
let pageSize = 5;
let sortField = "";
let sortAsc = true;

// Load data
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    products = data;
    render();
  });

// Render table
function render() {
  let filtered = filterByTitle(products);
  let sorted = sortData(filtered);
  let paginated = paginate(sorted);

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  paginated.forEach(p => {
    const tr = document.createElement("tr");
    tr.title = p.description;
    tr.onclick = () => showDetail(p);
    tr.title = p.description;
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>$${p.price}</td>
      <td>${p.category?.name}</td>
      <td><img src="${p.images[0]}" width="60"/></td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination(filtered.length);
}

// Search
document.getElementById("searchInput").oninput = () => {
  currentPage = 1;
  render();
};

function filterByTitle(data) {
  const keyword = searchInput.value.toLowerCase();
  return data.filter(p => p.title.toLowerCase().includes(keyword));
}

// Pagination
document.getElementById("pageSize").onchange = (e) => {
  pageSize = Number(e.target.value);
  currentPage = 1;
  render();
};

function paginate(data) {
  const start = (currentPage - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

function renderPagination(total) {
  const pages = Math.ceil(total / pageSize);
  const ul = document.getElementById("pagination");
  ul.innerHTML = "";

  for (let i = 1; i <= pages; i++) {
    ul.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" onclick="gotoPage(${i})">${i}</a>
      </li>
    `;
  }
}

function gotoPage(p) {
  currentPage = p;
  render();
}

// Sort
function sortBy(field) {
  sortAsc = sortField === field ? !sortAsc : true;
  sortField = field;
  render();
}

function sortData(data) {
  if (!sortField) return data;
  return [...data].sort((a, b) => {
    return sortAsc
      ? a[sortField] > b[sortField] ? 1 : -1
      : a[sortField] < b[sortField] ? 1 : -1;
  });
}

// Detail modal
function showDetail(p) {
  document.getElementById("detailBody").innerHTML = `
    <h5>${p.title}</h5>
    <p>${p.description}</p>
    <p><b>Price:</b> $${p.price}</p>
    <button class="btn btn-warning" onclick="updateProduct(${p.id})">Edit</button>
  `;
  new bootstrap.Modal("#detailModal").show();
}

// Update
function updateProduct(id) {
  fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Updated Title" })
  }).then(() => alert("Updated (fake API)"));
}

// Create
function createProduct() {
  const data = {
    title: cTitle.value,
    price: Number(cPrice.value),
    description: cDesc.value,
    categoryId: Number(cCategory.value),
    images: [cImage.value]
  };

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(() => alert("Created (fake API)"));
}

// Export CSV
function exportCSV() {
  let csv = "id,title,price\n";
  paginate(sortData(filterByTitle(products)))
    .forEach(p => {
      csv += `${p.id},${p.title},${p.price}\n`;
    });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "products.csv";
  a.click();
}
