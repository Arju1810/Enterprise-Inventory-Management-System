# Enterprise Inventory Management System

The **Enterprise Inventory Management System** is a full-stack inventory management web application designed to manage products, categories, suppliers, stock movements, transactions, alerts, and inventory reports.

The application uses a responsive frontend connected to an **ASP.NET Core Web API**, with **Dapper** for data access and **Microsoft SQL Server** for persistent data storage.

---

## Technology Stack

### Frontend
- HTML5
- CSS3
- Bootstrap 5
- JavaScript (ES6+)
- Font Awesome

### Backend
- C#
- ASP.NET Core Web API
- REST API
- Dependency Injection

### Data Access
- Dapper Micro-ORM
- Microsoft.Data.SqlClient

### Database
- Microsoft SQL Server
- SQL Server Management Studio (SSMS)

---

## Project Architecture

```text
Frontend
HTML + CSS + Bootstrap + JavaScript
                |
                | HTTP / REST API
                v
Backend
ASP.NET Core Web API
                |
                v
Repository Layer
Dapper
                |
                v
Database
Microsoft SQL Server
```

---

## Main Features

### Authentication

- Database-backed administrator login
- User information stored in the `Users` table
- Password stored as a hash instead of plain text
- Active-user validation
- Login through ASP.NET Core API
- Login session management
- Secure logout functionality
- Invalid credentials are rejected

### Dashboard

The dashboard provides real-time inventory information including:

- Total Products
- Total Categories
- Total Suppliers
- Available Stock
- Low-Stock Products
- Out-of-Stock Products
- Low-stock warning alerts
- Recent inventory transactions

Dashboard information is retrieved from the backend and SQL Server.

### Category Management

Supports complete CRUD operations:

- Add Category
- View Categories
- Update Category
- Delete Category

Categories referenced by products are protected from invalid deletion.

### Product Management

Supports complete product management:

- Add Product
- View Products
- Edit Product
- Delete Product
- Search Products
- Filter by Category
- Filter by Supplier

Product information includes:

- Product Name
- Category
- Supplier
- Unit Price
- Quantity
- Reorder Level

Input validation prevents invalid negative values.

### Supplier Management

Supports:

- Add Supplier
- View Suppliers
- Edit Supplier
- Delete Supplier

Supplier information includes:

- Supplier Name
- Phone
- Email
- Address

Supplier relationships with products are maintained through the database.

### Stock In

Stock In allows inventory to be received into the system.

When stock is added:

1. The selected product quantity is increased.
2. SQL Server is updated.
3. A Stock In transaction is created.
4. Dashboard statistics are updated.
5. The transaction appears in transaction history.

### Stock Out

Stock Out handles inventory deductions for sales, usage, damages, or other reasons.

The system:

- Checks available quantity
- Prevents stock from becoming negative
- Updates product quantity
- Creates a Stock Out transaction
- Updates Dashboard statistics
- Stores the transaction permanently in SQL Server

### Transaction History

The system maintains an inventory audit trail containing:

- Transaction ID
- Product
- Transaction Type
- Quantity
- Date/Time
- Transaction Details

Both Stock In and Stock Out operations are recorded.

### Inventory Reports

The Reports module supports:

- Current Stock Report
- Low-Stock Report
- Out-of-Stock Report
- Stock-In Report
- Stock-Out Report
- Category-wise Report
- Supplier-wise Report

Reports can also be printed or saved as PDF using the browser's print functionality.

---

## Database Tables

The application uses the following main SQL Server tables:

```text
Users
Categories
Suppliers
Products
InventoryTransactions
```

Relationships between Products, Categories, Suppliers, and Inventory Transactions maintain inventory data integrity.

---

## API Endpoints

### Authentication

```http
POST /api/Auth/login
```

### Categories

```http
GET    /api/Inventory/categories
POST   /api/Inventory/categories
PUT    /api/Inventory/categories/{id}
DELETE /api/Inventory/categories/{id}
```

### Products

```http
GET    /api/Inventory/products
POST   /api/Inventory/products
PUT    /api/Inventory/products/{id}
DELETE /api/Inventory/products/{id}
```

### Suppliers

```http
GET    /api/Inventory/suppliers
POST   /api/Inventory/suppliers
PUT    /api/Inventory/suppliers/{id}
DELETE /api/Inventory/suppliers/{id}
```

### Inventory Operations

```http
POST /api/Inventory/stock-in
POST /api/Inventory/stock-out
```

### Transactions and Dashboard

```http
GET /api/Inventory/transactions
GET /api/Inventory/dashboard
```

---

## Project Structure

```text
inventory-management-system/
│
├── index.html
├── styles.css
├── app.js
├── README.md
│
└── backend/
    └── InventoryManagementSystem/
        ├── Controllers/
        │   ├── InventoryController.cs
        │   └── AuthController.cs
        │
        ├── Models/
        │   ├── Models.cs
        │   └── LoginDto.cs
        │
        ├── Repositories/
        │   └── Repository.cs
        │
        ├── Program.cs
        ├── appsettings.json
        └── InventoryManagementSystem.csproj
```

---

## Database Configuration

Create a SQL Server database:

```sql
CREATE DATABASE InventoryDB;
```

Configure the database connection inside `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_SQL_SERVER_CONNECTION_STRING"
  }
}
```

Do not commit real database credentials to a public repository.

---

## Backend Setup

Open the ASP.NET Core project in Visual Studio.

Install the required NuGet packages:

```bash
dotnet add package Dapper
dotnet add package Microsoft.Data.SqlClient
```

Configure the repository using Dependency Injection in `Program.cs`.

Example:

```csharp
string connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")!;

builder.Services.AddScoped<IInventoryRepository>(
    provider => new InventoryRepository(connectionString)
);
```

Run the backend project.

Swagger can then be used to test the available API endpoints.

---

## Frontend Setup

Open the frontend project in VS Code.

The frontend API configuration is located in `app.js`:

```javascript
const API_BASE_URL = "https://localhost:7119/api/Inventory";
```

Make sure this URL matches the HTTPS address used by your ASP.NET Core backend.

Start the frontend using **Live Server**.

For example:

```text
http://127.0.0.1:5500
```

The ASP.NET Core backend must also be running for database operations and authentication to work.

---

## Login

For development/testing, an administrator account can be created in the `Users` table.

Authentication is performed through:

```http
POST /api/Auth/login
```

The frontend does not perform a hardcoded username/password comparison.

---

## Validation and Data Integrity

The system includes validation at both frontend and backend levels.

Examples include:

- Product name validation
- Non-negative unit price
- Non-negative initial quantity
- Non-negative reorder level
- Valid Category and Supplier relationships
- Insufficient Stock Out prevention
- Active-user authentication
- Invalid API requests return appropriate HTTP errors

---

## Testing

The following functionality has been tested:

- Login and invalid-login handling
- Login session persistence
- Logout
- Category CRUD
- Product CRUD
- Supplier CRUD
- Stock In
- Stock Out
- Insufficient-stock validation
- Transaction persistence
- Dashboard statistics
- Low-stock alerts
- Reports and filters
- Print / PDF reports
- Frontend validation
- Backend API validation
- SQL Server persistence after browser refresh

---

## Future Enhancements

Possible future improvements include:

- JWT-based authentication and authorization
- Multiple user roles and permissions
- Password reset functionality
- Password hashing using a password-specific algorithm such as PBKDF2, bcrypt, or Argon2
- Pagination for large inventories
- Export reports to Excel
- Product barcode support
- Inventory analytics and charts
- Cloud deployment
- Automated unit and integration testing

---

## Purpose

This project demonstrates practical implementation of:

- Full-stack web application development
- REST API development
- C# and ASP.NET Core
- JavaScript frontend integration
- SQL Server database design
- Dapper-based data access
- CRUD operations
- Inventory transaction processing
- Authentication
- Input validation
- Relational data management
- Reporting

---

## Project Status

**Core system completed and tested.**

The application is connected end-to-end:

```text
Frontend
   ↓
ASP.NET Core Web API
   ↓
Dapper
   ↓
Microsoft SQL Server
```