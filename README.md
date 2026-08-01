<p align="center">
  <img src="Assets/banner.png" alt="Enterprise Inventory Management System Banner" width="100%">
</p>

<h1 align="center">Enterprise Inventory Management System</h1>

<p align="center">
A Full-Stack Inventory Management Web Application built using HTML, CSS, Bootstrap, JavaScript, ASP.NET Core Web API, Dapper, and Microsoft SQL Server.
</p>

<p align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![C%23](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white)
![Dapper](https://img.shields.io/badge/Dapper-FF6F00?style=for-the-badge)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

</p>

---

# 📖 About the Project

Enterprise Inventory Management System is a full-stack web application developed to efficiently manage inventory operations for businesses. The system provides secure authentication, product management, category management, supplier management, stock tracking, transaction history, reports, and dashboard analytics using a modern ASP.NET Core Web API backend and Microsoft SQL Server database.

---
# ✨ Features

- 🔐 Secure User Authentication
- 📊 Interactive Dashboard with Inventory Statistics
- 📦 Product Management (CRUD)
- 🗂️ Category Management (CRUD)
- 🚚 Supplier Management (CRUD)
- 📥 Stock In Management
- 📤 Stock Out Management
- 📝 Inventory Transaction History
- 📈 Reports & Analytics
- 🔍 Search & Filter Functionality
- 🗄️ Microsoft SQL Server Database Integration
- ⚡ RESTful ASP.NET Core Web API
- 💾 Dapper ORM for High-Performance Database Access
- 📱 Responsive User Interface using Bootstrap 5

---
# 🛠️ Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | HTML5, CSS3, Bootstrap 5, JavaScript (ES6) |
| Backend | ASP.NET Core Web API (.NET 8), C# |
| Database | Microsoft SQL Server |
| ORM | Dapper |
| API Testing | Swagger (OpenAPI) |
| Version Control | Git & GitHub |
| IDE | Visual Studio 2022, Visual Studio Code |

---
# 🏗️ System Architecture

```text
                   User
                     │
                     ▼
        HTML • CSS • Bootstrap • JavaScript
                     │
              Fetch API (HTTP)
                     │
                     ▼
          ASP.NET Core Web API (.NET 8)
                     │
          Repository Pattern (Dapper)
                     │
                     ▼
           Microsoft SQL Server
```

The application follows a **3-tier architecture**:

- **Presentation Layer:** HTML, CSS, Bootstrap, JavaScript
- **Business Logic Layer:** ASP.NET Core Web API (C#)
- **Data Layer:** SQL Server with Dapper ORM

---
# 📂 Project Structure

```text
Enterprise-Inventory-Management-System/
│
├── Assets/
│   └── banner.png
│
├── Screenshot/
│   ├── 01-Login.png
│   ├── 02-Dashboard.png
│   ├── 03-Categories.png
│   ├── 04-Add-Category.png
│   ├── 05-Products.png
│   ├── 06-Add-Product.png
│   ├── 07-Suppliers.png
│   ├── 08-Add-Supplier.png
│   ├── 09-Stock-In.png
│   ├── 10-Stock-Out.png
│   ├── 11-Transactions.png
│   ├── 12-Reports.png
│   ├── 13-Swagger.png
│   └── 14-Database.png
│
├── backend/
│   └── InventoryManagementSystem/
│       ├── Controllers/
│       ├── Models/
│       ├── DTOs/
│       ├── Repositories/
│       ├── Program.cs
│       ├── appsettings.json
│       └── InventoryManagementSystem.csproj
│
├── app.js
├── index.html
├── styles.css
├── README.md
└── .gitignore
```

---