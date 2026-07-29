namespace InventoryManagementSystem.Models
{
    public class Category
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; } = "";
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class Supplier
    {
        public int SupplierID { get; set; }
        public string SupplierName { get; set; } = "";
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class Product
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; } = "";

        public int CategoryID { get; set; }
        public int? SupplierID { get; set; }

        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public int ReorderLevel { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class User
    {
        public int UserID { get; set; }
        public string Username { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public string? Email { get; set; }
        public string Role { get; set; } = "";
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class InventoryTransaction
    {
        public int TransactionID { get; set; }

        public int ProductID { get; set; }
        public string TransactionType { get; set; } = "";
        public int Quantity { get; set; }

        public int? SupplierID { get; set; }
        public string? Reason { get; set; }

        public DateTime TransactionDate { get; set; }
    }
    public class AddProductRequest
    {
        public string ProductName { get; set; } = "";
        public int CategoryID { get; set; }
        public int? SupplierID { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public int ReorderLevel { get; set; }
    }
    public class UpdateProductRequest
    {
        public string ProductName { get; set; } = "";
        public int CategoryID { get; set; }
        public int? SupplierID { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public int ReorderLevel { get; set; }
    }
    public class AddCategoryRequest
    {
        public string CategoryName { get; set; } = "";
        public string? Description { get; set; }
    }

    public class UpdateCategoryRequest
    {
        public string CategoryName { get; set; } = "";
        public string? Description { get; set; }
    }
    public class AddSupplierRequest
    {
        public string SupplierName { get; set; } = "";
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
    }

    public class UpdateSupplierRequest
    {
        public string SupplierName { get; set; } = "";
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
    }
    public class StockInRequest
    {
        public int ProductID { get; set; }
        public int Quantity { get; set; }
        public int? SupplierID { get; set; }
        public string? Reason { get; set; }
    }

    public class StockOutRequest
    {
        public int ProductID { get; set; }
        public int Quantity { get; set; }
        public string? Reason { get; set; }
    }
    public class DashboardStats
    {
        public int TotalProducts { get; set; }
        public int TotalCategories { get; set; }
        public int TotalSuppliers { get; set; }
        public int TotalStock { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
    }
    public class TransactionDetails
    {
        public int TransactionID { get; set; }
        public int ProductID { get; set; }
        public string ProductName { get; set; } = "";
        public string TransactionType { get; set; } = "";
        public int Quantity { get; set; }
        public int? SupplierID { get; set; }
        public string? SupplierName { get; set; }
        public string? Reason { get; set; }
        public DateTime TransactionDate { get; set; }
    }
}