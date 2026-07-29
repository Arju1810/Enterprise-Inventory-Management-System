using Dapper;
using Microsoft.Data.SqlClient;
using InventoryManagementSystem.Models;

namespace InventoryManagementSystem.Repositories
{
    public interface IInventoryRepository
    {
        Task<IEnumerable<Category>> GetCategoriesAsync();
        Task<IEnumerable<Supplier>> GetSuppliersAsync();
        Task<IEnumerable<Product>> GetProductsAsync();
        Task<IEnumerable<InventoryTransaction>> GetTransactionsAsync();

        Task<int> AddProductAsync(AddProductRequest product);
        Task<int> UpdateProductAsync(int id, UpdateProductRequest product);
        Task<int> DeleteProductAsync(int id);
        Task<int> AddCategoryAsync(AddCategoryRequest category);

        Task<int> UpdateCategoryAsync(
            int id,
            UpdateCategoryRequest category
        );

        Task<int> DeleteCategoryAsync(int id);
        Task<int> AddSupplierAsync(AddSupplierRequest supplier);

        Task<int> UpdateSupplierAsync(
            int id,
            UpdateSupplierRequest supplier
        );

        Task<int> DeleteSupplierAsync(int id);
        Task<bool> StockInAsync(StockInRequest request);

        Task<bool> StockOutAsync(StockOutRequest request);
        Task<DashboardStats> GetDashboardStatsAsync();
        Task<IEnumerable<TransactionDetails>>
    GetRecentTransactionsAsync();
        Task<User?> LoginAsync(string username, string password);
    }

    public class InventoryRepository : IInventoryRepository
    {
        private readonly string _connectionString;

        public InventoryRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        private SqlConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<IEnumerable<Category>> GetCategoriesAsync()
        {
            const string sql = @"
                SELECT
                    CategoryID,
                    CategoryName,
                    Description,
                    CreatedAt
                FROM dbo.Categories
                ORDER BY CategoryID";

            using var connection = CreateConnection();

            return await connection.QueryAsync<Category>(sql);
        }

        public async Task<IEnumerable<Supplier>> GetSuppliersAsync()
        {
            const string sql = @"
                SELECT
                    SupplierID,
                    SupplierName,
                    Phone,
                    Email,
                    Address,
                    CreatedAt
                FROM dbo.Suppliers
                ORDER BY SupplierID";

            using var connection = CreateConnection();

            return await connection.QueryAsync<Supplier>(sql);
        }

        public async Task<IEnumerable<Product>> GetProductsAsync()
        {
            const string sql = @"
                SELECT
                    ProductID,
                    ProductName,
                    CategoryID,
                    SupplierID,
                    UnitPrice,
                    Quantity,
                    ReorderLevel,
                    CreatedAt,
                    UpdatedAt
                FROM dbo.Products
                ORDER BY ProductID";

            using var connection = CreateConnection();

            return await connection.QueryAsync<Product>(sql);
        }
        public async Task<int> AddProductAsync(AddProductRequest product)
        {
            const string sql = @"
        INSERT INTO dbo.Products
        (
            ProductName,
            CategoryID,
            SupplierID,
            UnitPrice,
            Quantity,
            ReorderLevel
        )
        VALUES
        (
            @ProductName,
            @CategoryID,
            @SupplierID,
            @UnitPrice,
            @Quantity,
            @ReorderLevel
        );

        SELECT CAST(SCOPE_IDENTITY() AS INT);
    ";

            using var connection = CreateConnection();

            int productId = await connection.QuerySingleAsync<int>(
                sql,
                product
            );

            return productId;
        }
        public async Task<int> UpdateProductAsync(
    int id,
    UpdateProductRequest product)
        {
            const string sql = @"
        UPDATE dbo.Products

        SET ProductName = @ProductName,
            CategoryID = @CategoryID,
            SupplierID = @SupplierID,
            UnitPrice = @UnitPrice,
            Quantity = @Quantity,
            ReorderLevel = @ReorderLevel,
            UpdatedAt = GETDATE()

        WHERE ProductID = @ProductID;
    ";

            using var connection = CreateConnection();

            return await connection.ExecuteAsync(sql, new
            {
                ProductID = id,
                product.ProductName,
                product.CategoryID,
                product.SupplierID,
                product.UnitPrice,
                product.Quantity,
                product.ReorderLevel
            });
        }
        public async Task<int> AddCategoryAsync(
    AddCategoryRequest category)
        {
            const string sql = @"
        INSERT INTO dbo.Categories
        (
            CategoryName,
            Description
        )
        VALUES
        (
            @CategoryName,
            @Description
        );

        SELECT CAST(SCOPE_IDENTITY() AS INT);
    ";

            using var connection = CreateConnection();

            return await connection.QuerySingleAsync<int>(
                sql,
                category
            );
        }
        public async Task<int> UpdateCategoryAsync(
    int id,
    UpdateCategoryRequest category)
        {
            const string sql = @"
        UPDATE dbo.Categories

        SET CategoryName = @CategoryName,
            Description = @Description

        WHERE CategoryID = @CategoryID;
    ";

            using var connection = CreateConnection();

            return await connection.ExecuteAsync(sql, new
            {
                CategoryID = id,
                category.CategoryName,
                category.Description
            });
        }
        public async Task<int> DeleteCategoryAsync(int id)
        {
            const string sql = @"
        DELETE FROM dbo.Categories
        WHERE CategoryID = @CategoryID;
    ";

            using var connection = CreateConnection();

            return await connection.ExecuteAsync(
                sql,
                new { CategoryID = id }
            );
        }

        public async Task<IEnumerable<InventoryTransaction>> GetTransactionsAsync()
        {
            const string sql = @"
                SELECT
                    TransactionID,
                    ProductID,
                    TransactionType,
                    Quantity,
                    SupplierID,
                    Reason,
                    TransactionDate
                FROM dbo.InventoryTransactions
                ORDER BY TransactionDate DESC";

            using var connection = CreateConnection();

            return await connection.QueryAsync<InventoryTransaction>(sql);
        }
        public async Task<int> DeleteProductAsync(int id)
        {
            const string sql = @"
        DELETE FROM dbo.Products
        WHERE ProductID = @ProductID;
    ";

            using var connection = CreateConnection();

            return await connection.ExecuteAsync(
                sql,
                new { ProductID = id }
            );
        }
        public async Task<int> AddSupplierAsync(
    AddSupplierRequest supplier)
        {
            const string sql = @"
        INSERT INTO dbo.Suppliers
        (
            SupplierName,
            Phone,
            Email,
            Address
        )
        VALUES
        (
            @SupplierName,
            @Phone,
            @Email,
            @Address
        );

        SELECT CAST(SCOPE_IDENTITY() AS INT);
    ";

            using var connection = CreateConnection();

            return await connection.QuerySingleAsync<int>(
                sql,
                supplier
            );
        }
        public async Task<int> UpdateSupplierAsync(
    int id,
    UpdateSupplierRequest supplier)
        {
            const string sql = @"
        UPDATE dbo.Suppliers

        SET SupplierName = @SupplierName,
            Phone = @Phone,
            Email = @Email,
            Address = @Address

        WHERE SupplierID = @SupplierID;
    ";

            using var connection = CreateConnection();

            return await connection.ExecuteAsync(sql, new
            {
                SupplierID = id,
                supplier.SupplierName,
                supplier.Phone,
                supplier.Email,
                supplier.Address
            });
        }
        public async Task<int> DeleteSupplierAsync(int id)
        {
            const string sql = @"
        DELETE FROM dbo.Suppliers
        WHERE SupplierID = @SupplierID;
    ";

            using var connection = CreateConnection();

            return await connection.ExecuteAsync(
                sql,
                new { SupplierID = id }
            );
        }
        public async Task<bool> StockInAsync(StockInRequest request)
        {
            using var connection = CreateConnection();

            await connection.OpenAsync();

            using var transaction =
                await connection.BeginTransactionAsync();

            try
            {
                const string checkSql = @"
            SELECT COUNT(*)
            FROM dbo.Products
            WHERE ProductID = @ProductID;
        ";

                int productExists =
                    await connection.ExecuteScalarAsync<int>(
                        checkSql,
                        new { request.ProductID },
                        transaction
                    );

                if (productExists == 0)
                {
                    await transaction.RollbackAsync();
                    return false;
                }

                const string updateSql = @"
            UPDATE dbo.Products

            SET Quantity = Quantity + @Quantity,
                UpdatedAt = GETDATE()

            WHERE ProductID = @ProductID;
        ";

                await connection.ExecuteAsync(
                    updateSql,
                    new
                    {
                        request.ProductID,
                        request.Quantity
                    },
                    transaction
                );

                const string transactionSql = @"
            INSERT INTO dbo.InventoryTransactions
            (
                ProductID,
                TransactionType,
                Quantity,
                SupplierID,
                Reason,
                TransactionDate
            )
            VALUES
            (
                @ProductID,
                'Stock In',
                @Quantity,
                @SupplierID,
                @Reason,
                GETDATE()
            );
        ";

                await connection.ExecuteAsync(
                    transactionSql,
                    request,
                    transaction
                );

                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

        }
        public async Task<bool> StockOutAsync(StockOutRequest request)
        {
            using var connection = CreateConnection();

            await connection.OpenAsync();

            using var transaction =
                await connection.BeginTransactionAsync();

            try
            {
                const string stockSql = @"
            SELECT Quantity
            FROM dbo.Products
            WHERE ProductID = @ProductID;
        ";

                int? currentQuantity =
                    await connection.QuerySingleOrDefaultAsync<int?>(
                        stockSql,
                        new { request.ProductID },
                        transaction
                    );

                if (currentQuantity == null)
                {
                    await transaction.RollbackAsync();
                    return false;
                }

                if (currentQuantity.Value < request.Quantity)
                {
                    await transaction.RollbackAsync();

                    throw new InvalidOperationException(
                        "Insufficient stock."
                    );
                }

                const string updateSql = @"
            UPDATE dbo.Products

            SET Quantity = Quantity - @Quantity,
                UpdatedAt = GETDATE()

            WHERE ProductID = @ProductID;
        ";

                await connection.ExecuteAsync(
                    updateSql,
                    new
                    {
                        request.ProductID,
                        request.Quantity
                    },
                    transaction
                );

                const string transactionSql = @"
            INSERT INTO dbo.InventoryTransactions
            (
                ProductID,
                TransactionType,
                Quantity,
                SupplierID,
                Reason,
                TransactionDate
            )
            VALUES
            (
                @ProductID,
                'Stock Out',
                @Quantity,
                NULL,
                @Reason,
                GETDATE()
            );
        ";

                await connection.ExecuteAsync(
                    transactionSql,
                    request,
                    transaction
                );

                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<DashboardStats> GetDashboardStatsAsync()
        {
            const string sql = @"
        SELECT
            (SELECT COUNT(*) 
             FROM dbo.Products) AS TotalProducts,

            (SELECT COUNT(*) 
             FROM dbo.Categories) AS TotalCategories,

            (SELECT COUNT(*) 
             FROM dbo.Suppliers) AS TotalSuppliers,

            (SELECT ISNULL(SUM(Quantity), 0)
             FROM dbo.Products) AS TotalStock,

            (SELECT COUNT(*)
             FROM dbo.Products
             WHERE Quantity > 0
             AND Quantity <= ReorderLevel) AS LowStockCount,

            (SELECT COUNT(*)
             FROM dbo.Products
             WHERE Quantity = 0) AS OutOfStockCount;
    ";

            using var connection = CreateConnection();

            return await connection.QuerySingleAsync<DashboardStats>(sql);
        }
        public async Task<IEnumerable<TransactionDetails>>
    GetRecentTransactionsAsync()
        {
            const string sql = @"
        SELECT TOP 5
            t.TransactionID,
            t.ProductID,
            p.ProductName,
            t.TransactionType,
            t.Quantity,
            t.SupplierID,
            s.SupplierName,
            t.Reason,
            t.TransactionDate

        FROM dbo.InventoryTransactions t

        INNER JOIN dbo.Products p
            ON t.ProductID = p.ProductID

        LEFT JOIN dbo.Suppliers s
            ON t.SupplierID = s.SupplierID

        ORDER BY t.TransactionDate DESC;
    ";

            using var connection = CreateConnection();

            return await connection.QueryAsync<TransactionDetails>(sql);
        }
        public async Task<User?> LoginAsync(string username, string password)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();

            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(password);
            byte[] hashBytes = sha256.ComputeHash(bytes);

            string passwordHash = Convert.ToHexString(hashBytes);

            const string sql = @"
        SELECT
            UserID,
            Username,
            PasswordHash,
            Email,
            Role,
            IsActive,
            CreatedAt
        FROM dbo.Users
        WHERE Username = @Username
          AND PasswordHash = @PasswordHash
          AND IsActive = 1";

            using var connection = CreateConnection();

            return await connection.QueryFirstOrDefaultAsync<User>(
                sql,
                new
                {
                    Username = username,
                    PasswordHash = passwordHash
                }
            );
        }
    }

}