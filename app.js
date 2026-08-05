// Initialize application and connect to ASP.NET Core Web API
const API_BASE_URL = "https://localhost:7119/api/Inventory";
async function testBackendConnection() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/dashboard`
        );

        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }

        const data = await response.json();

        console.log("Backend connected successfully:");
        console.log(data);
    }
    catch (error) {
        console.error(
            "Backend connection failed:",
            error
        );
    }
}
async function loadProductsFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);

        if (!response.ok) {
            throw new Error(`Failed to load products: ${response.status}`);
        }

        const data = await response.json();

        products = data.map(p => ({
            id: p.productID,
            name: p.productName,
            categoryId: p.categoryID,
            supplierId: p.supplierID,
            price: Number(p.unitPrice),
            quantity: p.quantity,
            reorderLevel: p.reorderLevel
        }));

        console.log("Products loaded from SQL Server:", products);

        if (activeView === "products") {
            initProductFilters();
            renderProductsTable();
        }

    } catch (error) {
        console.error("Error loading products from API:", error);
    }
}

async function loadTransactionsFromAPI() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/dashboard/recent-transactions`
        );

        if (!response.ok) {
            throw new Error("Failed to load transactions");
        }

        const data = await response.json();

        transactions = data.map(t => {
            const product = products.find(
                p => Number(p.id) === Number(t.productID)
            );

            return {
                id: t.transactionID,
                date: t.transactionDate,
                productName: product
                    ? product.name
                    : `Product #${t.productID}`,
                type: t.transactionType,

                // Keep positive value.
                // renderTransactionsTable handles +/- display.
                quantity: t.quantity,

                detail: t.reason || "-"
            };
        });

        renderTransactionsTable();

        console.log(
            "Transactions loaded from SQL Server:",
            transactions
        );

    } catch (error) {
        console.error(
            "Error loading transactions:",
            error
        );
    }
}
async function loadCategoriesFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);

        if (!response.ok) {
            throw new Error(`Failed to load categories: ${response.status}`);
        }

        const data = await response.json();

        categories = data.map(c => ({
            id: c.categoryID,
            name: c.categoryName,
            description: c.description
        }));

        console.log("Categories loaded from SQL Server:", categories);

    } catch (error) {
        console.error("Error loading categories:", error);
    }
}
async function loadDashboardFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`);

        if (!response.ok) {
            throw new Error("Failed to load dashboard data");
        }

        const data = await response.json();

        // Dashboard cards - values directly from SQL Server
        document.getElementById('stat-products').textContent =
            data.totalProducts;

        document.getElementById('stat-categories').textContent =
            data.totalCategories;

        document.getElementById('stat-suppliers').textContent =
            data.totalSuppliers;

        document.getElementById('stat-stock').textContent =
            data.totalStock;

        document.getElementById('stat-low').textContent =
            data.lowStockCount;

        document.getElementById('stat-out').textContent =
            data.outOfStockCount;

        console.log("Dashboard loaded from SQL Server:", data);

    } catch (error) {
        console.error("Dashboard API Error:", error);
    }
}


async function loadSuppliersFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers`);

        if (!response.ok) {
            throw new Error(`Failed to load suppliers: ${response.status}`);
        }

        const data = await response.json();

        suppliers = data.map(s => ({
            id: s.supplierID,
            name: s.supplierName,
            phone: s.phone,
            email: s.email,
            address: s.address
        }));

        console.log("Suppliers loaded from SQL Server:", suppliers);

    } catch (error) {
        console.error("Error loading suppliers:", error);
    }
}

testBackendConnection();

// State objects
let categories = [];
let suppliers = [];
let products = [];
let transactions = [];
let currentUser = JSON.parse(localStorage.getItem('ims_user')) || null;
function isDemoUser() {
    return currentUser && currentUser.role === "Demo";
}

function enableDemoMode() {

    document.querySelectorAll(".btn-add").forEach(btn => {
        btn.style.display = "none";
    });

    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.style.display = "none";
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.style.display = "none";
    });

    setTimeout(() => {
        document.querySelectorAll(".demo-hide").forEach(item => {
            item.style.display = "none";
        });
    }, 300);

    showToast(
        "Demo Mode",
        "You are logged in as a Demo User. Editing features are disabled.",
        "info"
    );
}
// Global state variables
let activeView = 'dashboard';


// Save State Helper

// ---------------------------------------------------------------------
// 1. LOGIN & ROUTING MANAGEMENT
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    // Hide previous error
    document.getElementById('login-error-msg').classList.add('d-none');

    try {
        const response = await fetch(`${API_BASE_URL.replace('/Inventory', '')}/Auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            document.getElementById('login-error-msg').classList.remove('d-none');
            showToast("Access Denied", "Invalid username or password.", "danger");
            return;
        }

        const user = await response.json();
        console.log("API Response:", user);
        console.log("Role:", user.role);

        currentUser = {
            userID: user.userID,
            username: user.username,
            role: user.role,
            email: user.email,
            avatar: user.username.charAt(0).toUpperCase()
        };
        if (currentUser.role === "Demo") {
            enableDemoMode();
        }

        // Save login session
        localStorage.setItem('ims_user', JSON.stringify(currentUser));

        // Hide login and show application
        document.getElementById('login-container').classList.add('d-none');
        document.getElementById('app-container').classList.remove('d-none');

        // Populate profile
        document.getElementById('nav-username').textContent = currentUser.username;
        document.getElementById('nav-role').textContent = currentUser.role;
        document.getElementById('nav-avatar').textContent = currentUser.avatar;

        showToast(
            "Success",
            "Authentication successful. Welcome to Enterprise Inventory!",
            "success"
        );

        // Load dashboard
        navigate('dashboard');

    } catch (error) {
        console.error("Login API Error:", error);

        document.getElementById('login-error-msg').classList.remove('d-none');

        showToast(
            "Connection Error",
            "Unable to connect to the authentication server.",
            "danger"
        );
    }
});

function logout() {
    currentUser = null;
    localStorage.removeItem('ims_user');
    document.getElementById('login-container').classList.remove('d-none');
    document.getElementById('app-container').classList.add('d-none');
    document.getElementById('login-error-msg').classList.add('d-none');
    showToast("Signed Out", "Session closed successfully.", "info");
}

async function navigate(viewId) {
    activeView = viewId;
    
    // Manage section visibility
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
    document.getElementById(`view-${viewId}`).classList.remove('d-none');
    
    // Manage sidebar active class
    document.querySelectorAll('.sidebar-item-link').forEach(el => {
        el.classList.remove('active');
        if (el.getAttribute('href') === `#${viewId}`) {
            el.classList.add('active');
        }
    });

    // Update workspace header title
    const formattedTitle = viewId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    document.getElementById('page-title').textContent = formattedTitle;

    // View-specific actions
    if (viewId === 'dashboard') {
        updateDashboardView();
        loadDashboardFromAPI();
        
    } else if (viewId === 'categories') {
        await loadCategoriesFromAPI();
        renderCategoriesTable();
    } else if (viewId === 'products') {
        initProductFilters();
        renderProductsTable();
    } else if (viewId === 'suppliers') {
        await loadSuppliersFromAPI();
        renderSuppliersTable();
    } else if (viewId === 'stock-operations') {
        initStockFormDropdowns();
    } else if (viewId === 'transactions') {
        renderTransactionsTable();
    } else if (viewId === 'reports') {
        initReportDropdowns();
        updateReportFormState();
    }
}

// ---------------------------------------------------------------------
// 2. DASHBOARD CONTROLLER
// ---------------------------------------------------------------------
function updateDashboardView() {

    // Set Low Stock Warning Banner
    const lowStockItems = products.filter(p => parseInt(p.quantity) <= parseInt(p.reorderLevel));
    const lowBanner = document.getElementById('low-stock-alert-banner');
    if (lowStockItems.length > 0) {
        lowBanner.classList.remove('d-none');
        const names = lowStockItems.map(p => `${p.name} (${p.quantity} left)`).join(', ');
        document.getElementById('low-stock-alert-text').textContent = `Low stock on: ${names}. Reorder with suppliers.`;
    } else {
        lowBanner.classList.add('d-none');
    }

    // Set Recent Transactions
    const recentTableBody = document.querySelector('#dashboard-recent-table tbody');
    recentTableBody.innerHTML = '';
    const sortedTx = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    if (sortedTx.length === 0) {
        recentTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No recent stock movements.</td></tr>`;
    } else {
        sortedTx.forEach(tx => {
            const dateStr = new Date(tx.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            const isStockIn = tx.type === 'Stock In';
            const badgeClass = isStockIn ? 'badge-success' : 'badge-danger';
            const qtyText = isStockIn ? `+${tx.quantity}` : `${tx.quantity}`;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dateStr}</td>
                <td class="fw-bold">${tx.productName}</td>
                <td><span class="badge-custom ${badgeClass}">${tx.type}</span></td>
                <td class="${isStockIn ? 'text-success' : 'text-danger'} fw-bold">${qtyText}</td>
            `;
            recentTableBody.appendChild(tr);
        });
    }
}

// ---------------------------------------------------------------------
// 3. CATEGORY MANAGEMENT CRUD
// ---------------------------------------------------------------------
function renderCategoriesTable() {
    const tbody = document.querySelector('#categories-table tbody');
    tbody.innerHTML = '';
    
    categories.forEach(cat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${cat.id}</td>
            <td class="fw-bold">${cat.name}</td>
            <td class="text-muted">${cat.description || 'N/A'}</td>
            <td class="text-end">
    ${
            isDemoUser()
                ? ''
                : `
        <button class="btn btn-sm btn-outline-secondary me-1"
                onclick="openCategoryModal(${c.id})">
            <i class="fa-solid fa-pen"></i>
        </button>

        <button class="btn btn-sm btn-outline-danger"
                onclick="deleteCategory(${c.id})">
            <i class="fa-solid fa-trash"></i>
        </button>
        `
    }
</td>
        `;
        tbody.appendChild(tr);
    });
}

function openCategoryModal(catId = null) {
    const modalEl = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('categoryModalLabel');
    const form = document.getElementById('category-form');
    
    document.getElementById('category-id-field').value = catId || '';
    
    if (catId) {
        modalTitle.textContent = "Edit Category";
        const cat = categories.find(c => c.id === catId);
        document.getElementById('category-name-field').value = cat.name;
        document.getElementById('category-description-field').value = cat.description;
        
    } else {
        modalTitle.textContent = "Add Category";
        form.reset();
        
    }
    
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

document.getElementById('category-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = document.getElementById('category-id-field').value;
    const name = document.getElementById('category-name-field').value.trim();
    const desc = document.getElementById('category-description-field').value.trim();

    if (!name) {
        showToast(
            "Invalid Category",
            "Category name is required.",
            "danger"
        );
        return;
    }

    try {
        const categoryData = {
            categoryName: name,
            description: desc
        };

        let response;

        // EDIT CATEGORY
        if (id) {

            categoryData.categoryID = parseInt(id);

            response = await fetch(
                `${API_BASE_URL}/categories/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(categoryData)
                }
            );

        } else {

            // ADD CATEGORY
            response = await fetch(
                `${API_BASE_URL}/categories`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(categoryData)
                }
            );
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // Reload categories directly from SQL Server
        await loadCategoriesFromAPI();

        bootstrap.Modal
            .getInstance(document.getElementById('categoryModal'))
            .hide();

        renderCategoriesTable();

        if (id) {
            showToast(
                "Category Updated",
                `Category "${name}" updated successfully.`,
                "success"
            );
        } else {
            showToast(
                "Category Created",
                `Category "${name}" added successfully.`,
                "success"
            );
        }

        console.log("Category successfully saved to SQL Server.");

    } catch (error) {

        console.error("Category API Error:", error);

        showToast(
            "Category Failed",
            "Category could not be saved to SQL Server.",
            "danger"
        );
    }
});

async function deleteCategory(catId) {

    const cat = categories.find(c => c.id === catId);

    if (!cat) {
        showToast("Error", "Category not found.", "danger");
        return;
    }

    // Prevent deleting categories currently used by products
    const productRefs = products.some(p => p.categoryId === catId);

    if (productRefs) {
        showToast(
            "Cannot Delete",
            `Cannot delete category "${cat.name}" because products are using it.`,
            "danger"
        );
        return;
    }

    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/categories/${catId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // Reload latest data from SQL Server
        await loadCategoriesFromAPI();

        renderCategoriesTable();

        showToast(
            "Category Removed",
            `Category "${cat.name}" deleted successfully.`,
            "success"
        );

    } catch (error) {

        console.error("Delete Category Error:", error);

        showToast(
            "Delete Failed",
            "Category could not be deleted from SQL Server.",
            "danger"
        );
    }
}

// ---------------------------------------------------------------------
// 4. SUPPLIER MANAGEMENT CRUD
// ---------------------------------------------------------------------
function renderSuppliersTable() {
    const tbody = document.querySelector('#suppliers-table tbody');
    tbody.innerHTML = '';
    
    suppliers.forEach(sup => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${sup.id}</td>
            <td class="fw-bold">${sup.name}</td>
            <td>${sup.phone}</td>
            <td><a href="mailto:${sup.email}" class="text-indigo-300 text-decoration-none">${sup.email}</a></td>
            <td class="text-muted small">${sup.address}</td>
            <td><span small">${sup.products}</span></td>
            <td class="text-end">
    ${
            isDemoUser()
                ? ''
                : `
        <button class="btn btn-sm btn-outline-secondary me-1"
                onclick="openSupplierModal(${s.id})">
            <i class="fa-solid fa-pen"></i>
        </button>

        <button class="btn btn-sm btn-outline-danger"
                onclick="deleteSupplier(${s.id})">
            <i class="fa-solid fa-trash"></i>
        </button>
        `
    }
</td>
        `;
        tbody.appendChild(tr);
    });
}

function openSupplierModal(supId = null) {
    const modalEl = document.getElementById('supplierModal');
    const modalTitle = document.getElementById('supplierModalLabel');
    const form = document.getElementById('supplier-form');

    document.getElementById('supplier-id-field').value = supId || '';

    if (supId) {
        modalTitle.textContent = "Edit Supplier";

        const s = suppliers.find(
            su => Number(su.id) === Number(supId)
        );

        if (!s) {
            showToast(
                "Error",
                "Supplier not found.",
                "danger"
            );
            return;
        }

        document.getElementById('supplier-name-field').value =
            s.name || '';

        document.getElementById('supplier-phone-field').value =
            s.phone || '';

        document.getElementById('supplier-email-field').value =
            s.email || '';

        document.getElementById('supplier-address-field').value =
            s.address || '';

        // Temporary value because this field is required in HTML
        document.getElementById('supplier-products-field').value =
            s.products || 'Not specified';

    } else {
        modalTitle.textContent = "Add Supplier";
        form.reset();

        document.getElementById('supplier-id-field').value = '';
    }

    new bootstrap.Modal(modalEl).show();
}

document.getElementById('supplier-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = document.getElementById('supplier-id-field').value;
    const name = document.getElementById('supplier-name-field').value.trim();
    const phone = document.getElementById('supplier-phone-field').value.trim();
    const email = document.getElementById('supplier-email-field').value.trim();
    const address = document.getElementById('supplier-address-field').value.trim();

    if (!name) {
        showToast("Invalid Supplier", "Supplier name is required.", "danger");
        return;
    }

    try {
        const supplierData = {
            supplierName: name,
            phone: phone,
            email: email,
            address: address
        };

        let response;

        // EDIT SUPPLIER
        if (id) {

            supplierData.supplierID = parseInt(id);

            response = await fetch(
                `${API_BASE_URL}/suppliers/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(supplierData)
                }
            );

        } else {

            // ADD SUPPLIER
            response = await fetch(
                `${API_BASE_URL}/suppliers`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(supplierData)
                }
            );
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // Reload suppliers from SQL Server
        await loadSuppliersFromAPI();

        bootstrap.Modal
            .getInstance(document.getElementById('supplierModal'))
            .hide();

        renderSuppliersTable();

        if (id) {
            showToast(
                "Supplier Updated",
                `Supplier "${name}" updated successfully.`,
                "success"
            );
        } else {
            showToast(
                "Supplier Created",
                `Supplier "${name}" added successfully.`,
                "success"
            );
        }

    } catch (error) {
        console.error("Supplier API Error:", error);

        showToast(
            "Supplier Failed",
            "Supplier could not be saved to SQL Server.",
            "danger"
        );
    }
});

async function deleteSupplier(supId) {

    const sup = suppliers.find(
        s => Number(s.id) === Number(supId)
    );

    if (!sup) {
        showToast(
            "Error",
            "Supplier not found.",
            "danger"
        );
        return;
    }

    // Check whether products currently use this supplier
    const productRefs = products.some(
        p => Number(p.supplierId) === Number(supId)
    );

    if (productRefs) {
        showToast(
            "Cannot Delete",
            `Cannot delete supplier "${sup.name}" because products are using it.`,
            "danger"
        );
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to delete supplier "${sup.name}"?`
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/suppliers/${supId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // Reload latest suppliers from SQL Server
        await loadSuppliersFromAPI();

        renderSuppliersTable();

        showToast(
            "Supplier Removed",
            `Supplier "${sup.name}" deleted successfully.`,
            "success"
        );

    } catch (error) {

        console.error("Delete Supplier Error:", error);

        showToast(
            "Delete Failed",
            "Supplier could not be deleted from SQL Server.",
            "danger"
        );
    }
}
// ---------------------------------------------------------------------
// 5. PRODUCT MANAGEMENT CRUD
// ---------------------------------------------------------------------
function initProductFilters() {
    const catSelect = document.getElementById('product-category-filter');
    const supSelect = document.getElementById('product-supplier-filter');
    
    catSelect.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(c => {
        catSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });

    supSelect.innerHTML = '<option value="all">All Suppliers</option>';
    suppliers.forEach(s => {
        supSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });
}

function renderProductsTable(filteredProducts = null) {
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = '';
    const prdList = filteredProducts || products;
    
    if (prdList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">No matching products found.</td></tr>`;
        return;
    }
    
    prdList.forEach(p => {
        const cat = categories.find(c => c.id == p.categoryId)?.name || 'Unknown';
        const sup = suppliers.find(s => s.id == p.supplierId)?.name || 'Unknown';
        
        let statusBadge = '';
        const qty = parseInt(p.quantity);
        const reorder = parseInt(p.reorderLevel);
        
        if (qty === 0) {
            statusBadge = `<span class="badge-custom badge-danger"><i class="out-of-stock-pulse me-1"></i>Out of Stock</span>`;
        } else if (qty <= reorder) {
            statusBadge = `<span class="badge-custom badge-warning"><i class="low-stock-pulse me-1"></i>Low Stock</span>`;
        } else {
            statusBadge = `<span class="badge-custom badge-success">Available</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${p.id}</td>
            <td class="fw-bold">${p.name}</td>
            <td>${cat}</td>
            <td class="fw-bold">$${p.price.toFixed(2)}</td>
            <td class="${qty <= reorder ? 'text-warning fw-bold' : ''}">${qty} units</td>
            <td class="text-muted small">${sup}</td>
            <td>${reorder} units</td>
            <td>${statusBadge}</td>
           <td class="text-end">
    ${
            isDemoUser()
                ? ''
                : `
        <button class="btn btn-sm btn-outline-secondary me-1" onclick="openProductModal(${p.id})">
            <i class="fa-solid fa-pen"></i>
        </button>

        <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">
            <i class="fa-solid fa-trash"></i>
        </button>
        `
    }
</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterProducts() {
    const q = document.getElementById('product-search-input').value.toLowerCase().trim();
    const cat = document.getElementById('product-category-filter').value;
    const sup = document.getElementById('product-supplier-filter').value;
    
    const filtered = products.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(q) || String(p.id).includes(q);
        const matchesCategory = cat === 'all' || p.categoryId == cat;
        const matchesSupplier = sup === 'all' || p.supplierId == sup;
        return matchesQuery && matchesCategory && matchesSupplier;
    });
    
    renderProductsTable(filtered);
}

function openProductModal(prdId = null) {
    const modalEl = document.getElementById('productModal');
    const modalTitle = document.getElementById('productModalLabel');
    const form = document.getElementById('product-form');
    
    // Set Dropdowns
    const catSelect = document.getElementById('product-category-field');
    const supSelect = document.getElementById('product-supplier-field');
    
    catSelect.innerHTML = '<option value="">Select Category...</option>';
    categories.forEach(c => catSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    
    supSelect.innerHTML = '<option value="">Select Supplier...</option>';
    suppliers.forEach(s => supSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`);
    
    document.getElementById('product-id-field').value = prdId || '';
    
    if (prdId) {
        modalTitle.textContent = "Edit Product";
        const p = products.find(pr => pr.id === prdId);
        document.getElementById('product-name-field').value = p.name;
        document.getElementById('product-category-field').value = p.categoryId;
        document.getElementById('product-price-field').value = p.price;
        document.getElementById('product-quantity-field').value = p.quantity;
        document.getElementById('product-quantity-field').setAttribute('readonly', 'true'); // Stock adjustments should go via Stock In/Out workflow
        document.getElementById('product-supplier-field').value = p.supplierId;
        document.getElementById('product-reorder-field').value = p.reorderLevel;
        
    } else {
        modalTitle.textContent = "Add Product";
        form.reset();
        document.getElementById('product-quantity-field').removeAttribute('readonly');

    }
    
    new bootstrap.Modal(modalEl).show();
}

document.getElementById('product-form').addEventListener('submit', async function (e) { 
    e.preventDefault();
    const id = document.getElementById('product-id-field').value;
    const name = document.getElementById('product-name-field').value.trim();
    const catId = parseInt(document.getElementById('product-category-field').value);
    const price = parseFloat(document.getElementById('product-price-field').value);
    const qty = parseInt(document.getElementById('product-quantity-field').value);
    const supId = parseInt(document.getElementById('product-supplier-field').value);
    const reorder = parseInt(document.getElementById('product-reorder-field').value);
    
    if (id) {
        try {
            const updatedProduct = {
                productID: parseInt(id),
                productName: name,
                categoryID: catId,
                supplierID: supId,
                unitPrice: price,
                quantity: qty,
                reorderLevel: reorder
            };

            const response = await fetch(
                `${API_BASE_URL}/products/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedProduct)
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            await loadProductsFromAPI();
            await loadTransactionsFromAPI();

            showToast(
                "Product Updated",
                `Product "${name}" updated successfully.`,
                "success"
            );

            

        } catch (error) {
            console.error("Update Product Error:", error);

            showToast(
                "Error",
                "Product could not be updated.",
                "danger"
            );

            return;
        }
    } else {
    try {
        const newProduct = {
            productName: name,
            categoryID: catId,
            supplierID: supId,
            unitPrice: price,
            quantity: qty,
            reorderLevel: reorder
        };

        const response = await fetch(`${API_BASE_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newProduct)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        showToast(
            "Product Added",
            `Product "${name}" added to SQL Server.`,
            "success"
        );

        

        await loadProductsFromAPI();

    } catch (error) {
        console.error("Add Product Error:", error);

        showToast(
            "Error",
            "Product could not be added to SQL Server.",
            "danger"
        );

        return;
    }
}

    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    renderProductsTable();
});

async function deleteProduct(prdId) {

    const p = products.find(pr => pr.id == prdId);

    if (!p) {
        showToast("Error", "Product not found.", "danger");
        return;
    }

    const confirmed = confirm(
        `Delete product "${p.name}"?\n\nThis will permanently delete it from the database.`
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/products/${prdId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // Reload products directly from SQL Server
        await loadProductsFromAPI();

        showToast(
            "Product Deleted",
            `Product "${p.name}" deleted successfully.`,
            "success"
        );

        

        renderProductsTable();

    } catch (error) {

        console.error("Delete Product Error:", error);

        showToast(
            "Delete Failed",
            "Product could not be deleted from SQL Server.",
            "danger"
        );
    }
}

// ---------------------------------------------------------------------
// 6. STOCK-IN PROCESS
// ---------------------------------------------------------------------
function initStockFormDropdowns() {
    const inSelect = document.getElementById('stock-in-product');
    const outSelect = document.getElementById('stock-out-product');
    
    inSelect.innerHTML = '<option value="">Choose product...</option>';
    outSelect.innerHTML = '<option value="">Choose product...</option>';
    
    products.forEach(p => {
        inSelect.innerHTML += `<option value="${p.id}">${p.name} (ID: ${p.id})</option>`;
        outSelect.innerHTML += `<option value="${p.id}">${p.name} (Qty: ${p.quantity})</option>`;
    });

    document.getElementById('stock-in-date').valueAsDate = new Date();
    document.getElementById('stock-out-hint').classList.add('d-none');
}

function updateStockInSupplierSelect() {
    const prdId = document.getElementById('stock-in-product').value;
    const supSelect = document.getElementById('stock-in-supplier');
    
    supSelect.innerHTML = '<option value="">Select supplier...</option>';
    
    if (prdId) {
        const p = products.find(pr => pr.id == prdId);
        const supplier = suppliers.find(s => s.id == p.supplierId);
        if (supplier) {
            supSelect.innerHTML = `<option value="${supplier.id}" selected>${supplier.name}</option>`;
        }
    }
    // Populate all other suppliers too as backup options
    suppliers.forEach(s => {
        if (!supSelect.querySelector(`option[value="${s.id}"]`)) {
            supSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
        }
    });
}
document.getElementById('stock-in-form').addEventListener('submit', async function (e) {
    e.preventDefault();
        if (isDemoUser()) {
            showToast(
                "Demo Mode",
                "Stock In is disabled in Demo Mode.",
                "warning"
            );
            return;
        }

    // Rest of your existing code...

    const prdId = parseInt(
        document.getElementById('stock-in-product').value
    );

    const qty = parseInt(
        document.getElementById('stock-in-qty').value
    );

    const supId = parseInt(
        document.getElementById('stock-in-supplier').value
    );

    const p = products.find(pr => pr.id === prdId);

    if (!p) {
        showToast("Error", "Please select a valid product.", "danger");
        return;
    }

    if (!qty || qty <= 0) {
        showToast("Error", "Quantity must be greater than 0.", "danger");
        return;
    }

    if (!supId) {
        showToast("Error", "Please select a supplier.", "danger");
        return;
    }

    const oldQty = p.quantity;

    try {

        const stockData = {
            productID: prdId,
            quantity: qty,
            supplierID: supId,
            reason: "Stock received"
        };

        const response = await fetch(
            `${API_BASE_URL}/stock-in`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(stockData)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // Get latest quantities directly from SQL Server
        await loadProductsFromAPI();

        const updatedProduct =
            products.find(pr => pr.id === prdId);

        showToast(
            "Stock Incremented",
            `${qty} units added to "${p.name}". Stock updated: ${oldQty} → ${updatedProduct.quantity}`,
            "success"
        );

        document.getElementById('stock-in-form').reset();

        initStockFormDropdowns();

        renderProductsTable();

        console.log("Stock In successfully saved to SQL Server.");

    } catch (error) {

        console.error("Stock In Error:", error);

        showToast(
            "Stock In Failed",
            "Stock could not be added to SQL Server.",
            "danger"
        );
    }
});

// ---------------------------------------------------------------------
// 7. STOCK-OUT PROCESS
// ---------------------------------------------------------------------
function showAvailableStockHint() {
    const prdId = document.getElementById('stock-out-product').value;
    const hint = document.getElementById('stock-out-hint');
    const val = document.getElementById('stock-out-hint-val');
    
    if (prdId) {
        const p = products.find(pr => pr.id == prdId);
        val.textContent = p.quantity;
        hint.classList.remove('d-none');
    } else {
        hint.classList.add('d-none');
    }
}

document.getElementById('stock-out-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (isDemoUser()) {
        showToast(
            "Demo Mode",
            "Stock Out is disabled in Demo Mode.",
            "warning"
        );
        return;
    }

    // Your existing code continues...


    const prdId = parseInt(
        document.getElementById('stock-out-product').value
    );

    const qty = parseInt(
        document.getElementById('stock-out-qty').value
    );

    const reason = document
        .getElementById('stock-out-reason')
        .value
        .trim();

    const p = products.find(pr => pr.id === prdId);

    // Check product
    if (!p) {
        showToast(
            "Error",
            "Please select a valid product.",
            "danger"
        );
        return;
    }

    // Check quantity
    if (!qty || qty <= 0) {
        showToast(
            "Invalid Quantity",
            "Quantity must be greater than 0.",
            "danger"
        );
        return;
    }

    // Check available stock
    if (p.quantity < qty) {
        showToast(
            "Insufficient Stock",
            `Only ${p.quantity} units available of "${p.name}".`,
            "danger"
        );
        return;
    }

    const oldQty = p.quantity;

    try {

        const stockData = {
            productID: prdId,
            quantity: qty,
            reason: reason || "Stock issued"
        };

        const response = await fetch(
            `${API_BASE_URL}/stock-out`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(stockData)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // Reload latest products from SQL Server
        await loadProductsFromAPI();

        const updatedProduct =
            products.find(pr => pr.id === prdId);

        showToast(
            "Stock Deducted",
            `${qty} units removed from "${p.name}". Stock updated: ${oldQty} → ${updatedProduct.quantity}`,
            "warning"
        );

        document.getElementById('stock-out-form').reset();

        initStockFormDropdowns();

        renderProductsTable();

        console.log("Stock Out successfully saved to SQL Server.");

    } catch (error) {

        console.error("Stock Out Error:", error);

        showToast(
            "Stock Out Failed",
            "Stock could not be removed from SQL Server.",
            "danger"
        );
    }
});

// ---------------------------------------------------------------------
// 8. TRANSACTION LOG CONTROLLER
// ---------------------------------------------------------------------
function renderTransactionsTable() {
    const tbody = document.querySelector('#transactions-table tbody');
    tbody.innerHTML = '';
    
    // Sort transactions by date descending
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No transactions logged.</td></tr>`;
        return;
    }
    
    sorted.forEach(t => {
        const isStockIn = t.type === 'Stock In';
        const badge = `<span class="badge-custom ${isStockIn ? 'badge-success' : 'badge-danger'}">${t.type}</span>`;
        const qtyChg = isStockIn ? `+${t.quantity}` : `-${Math.abs(t.quantity)}`;
        
        const dateFormatted = new Date(t.date).toLocaleString('en-US', { 
            year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted small">${dateFormatted}</td>
            <td class="fw-bold">${t.productName}</td>
            <td>${badge}</td>
            <td class="${isStockIn ? 'text-success' : 'text-danger'} fw-bold">${qtyChg}</td>
            <td class="text-muted small">${t.detail}</td>
        `;
        tbody.appendChild(tr);
    });
}


// ---------------------------------------------------------------------
// 9. REPORTS GENERATOR CONTROLLER
// ---------------------------------------------------------------------
function initReportDropdowns() {
    const catSelect = document.getElementById('report-category-select');
    const supSelect = document.getElementById('report-supplier-select');
    
    catSelect.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(c => catSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    
    supSelect.innerHTML = '<option value="all">All Suppliers</option>';
    suppliers.forEach(s => supSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`);
}

function updateReportFormState() {
    const reportType = document.getElementById('report-type-select').value;
    const catGroup = document.getElementById('report-category-group');
    const supGroup = document.getElementById('report-supplier-group');
    
    // Hide category/supplier filters for transaction reports
    if (reportType.includes('stock-') && reportType !== 'current-stock' && reportType !== 'low-stock' && reportType !== 'out-of-stock') {
        catGroup.style.display = 'none';
        supGroup.style.display = 'none';
    } else {
        catGroup.style.display = 'block';
        supGroup.style.display = 'block';
    }
}

function resetReportFilters() {
    document.getElementById('report-type-select').selectedIndex = 0;
    document.getElementById('report-category-select').selectedIndex = 0;
    document.getElementById('report-supplier-select').selectedIndex = 0;
    document.getElementById('report-output-container').classList.add('d-none');
    updateReportFormState();
}

async function generateReport() {
    await loadProductsFromAPI();
    await loadCategoriesFromAPI();
    await loadSuppliersFromAPI();
    await loadTransactionsFromAPI();
    const type = document.getElementById('report-type-select').value;
    const catId = document.getElementById('report-category-select').value;
    const supId = document.getElementById('report-supplier-select').value;
    
    const outputContainer = document.getElementById('report-output-container');
    const reportTitle = document.getElementById('report-title-label');
    const tableHead = document.querySelector('#report-output-table thead');
    const tableBody = document.querySelector('#report-output-table tbody');
    
    outputContainer.classList.remove('d-none');
    tableBody.innerHTML = '';
    
   
    
    // 1. Transaction Reports
    if (type === 'stock-in' || type === 'stock-out') {
        reportTitle.textContent = type === 'stock-in' ? "Stock-In Log Report" : "Stock-Out Log Report";
        tableHead.innerHTML = `
            <tr>
                <th>Timestamp</th>
                <th>Product Name</th>
                <th>Change Qty</th>
                <th>Details (Supplier / Reason)</th>
            </tr>
        `;
        
        const filterType = type === 'stock-in' ? 'Stock In' : 'Stock Out';
        const filteredTx = transactions.filter(t => t.type === filterType);
        
        if (filteredTx.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No matching logs found.</td></tr>`;
            return;
        }
        
        filteredTx.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(t.date).toLocaleString()}</td>
                <td class="fw-bold">${t.productName}</td>
                <td class="${isFinite(t.quantity) && t.quantity > 0 ? 'text-success' : 'text-danger'} fw-bold">${t.quantity}</td>
                <td>${t.detail}</td>
            `;
            tableBody.appendChild(tr);
        });
        return;
    }
    
    // 2. Product/Stock Reports
    let matchedProducts = [...products];
    
    if (type === 'low-stock') {
        reportTitle.textContent = "Low-Stock Reorder Alert Report";
        matchedProducts = matchedProducts.filter(p => p.quantity <= p.reorderLevel && p.quantity > 0);
    } else if (type === 'out-of-stock') {
        reportTitle.textContent = "Out-of-Stock Deficit Report";
        matchedProducts = matchedProducts.filter(p => p.quantity === 0);
    } else if (type === 'category-wise') {
        const catName = categories.find(c => c.id == catId)?.name || 'All';
        reportTitle.textContent = `Category Stock Report: ${catName}`;
        if (catId !== 'all') matchedProducts = matchedProducts.filter(p => p.categoryId == catId);
    } else if (type === 'supplier-wise') {
        const supName = suppliers.find(s => s.id == supId)?.name || 'All';
        reportTitle.textContent = `Supplier Stock Report: ${supName}`;
        if (supId !== 'all') matchedProducts = matchedProducts.filter(p => p.supplierId == supId);
    } else {
        reportTitle.textContent = "Current Stock Inventory Report";
        // Apply categories and suppliers filters
        if (catId !== 'all') matchedProducts = matchedProducts.filter(p => p.categoryId == catId);
        if (supId !== 'all') matchedProducts = matchedProducts.filter(p => p.supplierId == supId);
    }
    
    tableHead.innerHTML = `
        <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Supplier</th>
            <th>Available Qty</th>
            <th>Unit Price</th>
            <th>Asset Value</th>
            <th>Status</th>
        </tr>
    `;
    
    if (matchedProducts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-3">No inventory items matched parameters.</td></tr>`;
        return;
    }
    
    matchedProducts.forEach(p => {
        const cat = categories.find(c => c.id == p.categoryId)?.name || 'Unknown';
        const sup = suppliers.find(s => s.id == p.supplierId)?.name || 'Unknown';
        const assetValue = p.price * p.quantity;
        
        let status = '';
        if (p.quantity === 0) status = '<span class="text-danger fw-bold">Out of Stock</span>';
        else if (p.quantity <= p.reorderLevel) status = '<span class="text-warning fw-bold">Low Stock</span>';
        else status = '<span class="text-success">Healthy</span>';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${p.id}</td>
            <td class="fw-bold">${p.name}</td>
            <td>${cat}</td>
            <td class="text-muted small">${sup}</td>
            <td>${p.quantity} units</td>
            <td>$${p.price.toFixed(2)}</td>
            <td class="fw-bold">$${assetValue.toFixed(2)}</td>
            <td>${status}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function printReport() {
    const reportTitle = document.getElementById('report-title-label').textContent;
    const printContent = document.getElementById('printable-report-area').innerHTML;
    
    const originalBody = document.body.innerHTML;
    
    // Open new print preview window
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html>
        <head>
            <title>${reportTitle}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { font-family: sans-serif; padding: 2rem; color: #111; background-color: #fff; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h2 { border-bottom: 2px solid #333; padding-bottom: 5px; }
            </style>
        </head>
        <body>
            <h2>${reportTitle}</h2>
            <p class="text-muted small">Generated on: ${new Date().toLocaleString()}</p>
            ${printContent}
            <script>
                window.onload = function() { window.print(); window.close(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ---------------------------------------------------------------------
// 10. TOAST NOTIFICATIONS HELPER
// ---------------------------------------------------------------------
function showToast(title, message, type = 'info') {
    const wrapper = document.getElementById('toast-wrapper');
    const toastId = 'toast-' + Date.now();

    let icon = 'info-circle';
    if (type === 'success') icon = 'circle-check';
    else if (type === 'warning') icon = 'triangle-exclamation';
    else if (type === 'danger') icon = 'circle-xmark';

    let borderColor = "#3B82F6";

    if (type === "success") borderColor = "#22C55E";
    else if (type === "warning") borderColor = "#F59E0B";
    else if (type === "danger") borderColor = "#EF4444";

    let headerColor = 'text-info';

    if (type === 'success') {
        headerColor = 'text-success';
    }
    else if (type === 'warning') {
        headerColor = 'text-warning';
    }
    else if (type === 'danger') {
        headerColor = 'text-danger';
    }

    const toastHTML = `
    <div id="${toastId}"
         class="toast glass-card"
         role="alert"
         aria-live="assertive"
         aria-atomic="true"
         style="background-color:#121829; border:1px solid ${borderColor};">

        <div class="toast-header border-bottom border-secondary"
             style="background-color: rgba(25,33,56,0.4);">

            <i class="fa-solid fa-${icon} ${headerColor} me-2"></i>
            <strong class="me-auto">${title}</strong>
            <small class="text-muted">just now</small>

            <button type="button"
                    class="btn-close btn-close-white"
                    data-bs-dismiss="toast"
                    aria-label="Close"></button>
        </div>

        <div class="toast-body text-white small">
            ${message}
        </div>

    </div>
    `;

    wrapper.insertAdjacentHTML('beforeend', toastHTML);

    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });

    toast.show();
    
    // Cleanup DOM on hide
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// ---------------------------------------------------------------------
// 12. INITIALIZATION ON DOCUMENT READY
// ---------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    await loadCategoriesFromAPI();
    await loadSuppliersFromAPI();
    await loadProductsFromAPI();
    await loadTransactionsFromAPI();
    await loadDashboardFromAPI();
    // Check if session is active
    if (currentUser) {
        document.getElementById('login-container').classList.add('d-none');
        document.getElementById('app-container').classList.remove('d-none');
        
        // Populate profile
        document.getElementById('nav-username').textContent = "Administrator";
        document.getElementById('nav-role').textContent = currentUser.role;
        document.getElementById('nav-avatar').textContent = currentUser.avatar;
        
        navigate('dashboard');
    } else {
        document.getElementById('login-container').classList.remove('d-none');
        document.getElementById('app-container').classList.add('d-none');
    }
});
