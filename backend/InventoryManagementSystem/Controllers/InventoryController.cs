using InventoryManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;
using InventoryManagementSystem.Repositories;


namespace InventoryManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryRepository _repository;

        public InventoryController(IInventoryRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories =
                await _repository.GetCategoriesAsync();

            return Ok(categories);
        }

        [HttpGet("suppliers")]
        public async Task<IActionResult> GetSuppliers()
        {
            var suppliers =
                await _repository.GetSuppliersAsync();

            return Ok(suppliers);
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            var products =
                await _repository.GetProductsAsync();

            return Ok(products);
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            var transactions =
                await _repository.GetTransactionsAsync();

            return Ok(transactions);
        }
        [HttpPost("products")]
        public async Task<IActionResult> AddProduct(
    [FromBody] AddProductRequest product)
        {
            if (string.IsNullOrWhiteSpace(product.ProductName))
            {
                return BadRequest("Product name is required.");
            }

            if (product.UnitPrice < 0)
            {
                return BadRequest("Unit price cannot be negative.");
            }

            if (product.Quantity < 0)
            {
                return BadRequest("Quantity cannot be negative.");
            }

            if (product.ReorderLevel < 0)
            {
                return BadRequest("Reorder level cannot be negative.");
            }

            var productId =
                await _repository.AddProductAsync(product);

            return Ok(new
            {
                message = "Product added successfully",
                productID = productId
            });
        }
        [HttpPut("products/{id}")]
        public async Task<IActionResult> UpdateProduct(
    int id,
    [FromBody] UpdateProductRequest product)
        {
            if (string.IsNullOrWhiteSpace(product.ProductName))
            {
                return BadRequest("Product name is required.");
            }

            if (product.UnitPrice < 0 ||
                product.Quantity < 0 ||
                product.ReorderLevel < 0)
            {
                return BadRequest(
                    "Price, quantity and reorder level cannot be negative.");
            }

            var rowsAffected =
                await _repository.UpdateProductAsync(id, product);

            if (rowsAffected == 0)
            {
                return NotFound("Product not found.");
            }

            return Ok(new
            {
                message = "Product updated successfully",
                productID = id
            });
        }
        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var rowsAffected =
                await _repository.DeleteProductAsync(id);

            if (rowsAffected == 0)
            {
                return NotFound("Product not found.");
            }

            return Ok(new
            {
                message = "Product deleted successfully",
                productID = id
            });
        }
        [HttpPost("categories")]
        public async Task<IActionResult> AddCategory(
    [FromBody] AddCategoryRequest category)
        {
            if (string.IsNullOrWhiteSpace(category.CategoryName))
            {
                return BadRequest("Category name is required.");
            }

            var categoryId =
                await _repository.AddCategoryAsync(category);

            return Ok(new
            {
                message = "Category added successfully",
                categoryID = categoryId
            });
        }
        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(
    int id,
    [FromBody] UpdateCategoryRequest category)
        {
            if (string.IsNullOrWhiteSpace(category.CategoryName))
            {
                return BadRequest("Category name is required.");
            }

            var rowsAffected =
                await _repository.UpdateCategoryAsync(id, category);

            if (rowsAffected == 0)
            {
                return NotFound("Category not found.");
            }

            return Ok(new
            {
                message = "Category updated successfully",
                categoryID = id
            });
        }
        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var rowsAffected =
                await _repository.DeleteCategoryAsync(id);

            if (rowsAffected == 0)
            {
                return NotFound("Category not found.");
            }

            return Ok(new
            {
                message = "Category deleted successfully",
                categoryID = id
            });
        }
        [HttpPost("suppliers")]
        public async Task<IActionResult> AddSupplier(
    [FromBody] AddSupplierRequest supplier)
        {
            if (string.IsNullOrWhiteSpace(supplier.SupplierName))
            {
                return BadRequest("Supplier name is required.");
            }

            var supplierId =
                await _repository.AddSupplierAsync(supplier);

            return Ok(new
            {
                message = "Supplier added successfully",
                supplierID = supplierId
            });
        }
        [HttpPut("suppliers/{id}")]
        public async Task<IActionResult> UpdateSupplier(
    int id,
    [FromBody] UpdateSupplierRequest supplier)
        {
            if (string.IsNullOrWhiteSpace(supplier.SupplierName))
            {
                return BadRequest("Supplier name is required.");
            }

            var rowsAffected =
                await _repository.UpdateSupplierAsync(id, supplier);

            if (rowsAffected == 0)
            {
                return NotFound("Supplier not found.");
            }

            return Ok(new
            {
                message = "Supplier updated successfully",
                supplierID = id
            });
        }
        [HttpDelete("suppliers/{id}")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            var rowsAffected =
                await _repository.DeleteSupplierAsync(id);

            if (rowsAffected == 0)
            {
                return NotFound("Supplier not found.");
            }

            return Ok(new
            {
                message = "Supplier deleted successfully",
                supplierID = id
            });
        }
        [HttpPost("stock-in")]
        public async Task<IActionResult> StockIn(
    [FromBody] StockInRequest request)
        {
            if (request.Quantity <= 0)
            {
                return BadRequest(
                    "Quantity must be greater than zero."
                );
            }

            var success =
                await _repository.StockInAsync(request);

            if (!success)
            {
                return NotFound("Product not found.");
            }

            return Ok(new
            {
                message = "Stock added successfully",
                productID = request.ProductID,
                quantityAdded = request.Quantity
            });
        }
        [HttpPost("stock-out")]
        public async Task<IActionResult> StockOut(
    [FromBody] StockOutRequest request)
        {
            if (request.Quantity <= 0)
            {
                return BadRequest(
                    "Quantity must be greater than zero."
                );
            }

            try
            {
                var success =
                    await _repository.StockOutAsync(request);

                if (!success)
                {
                    return NotFound("Product not found.");
                }

                return Ok(new
                {
                    message = "Stock removed successfully",
                    productID = request.ProductID,
                    quantityRemoved = request.Quantity
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var stats =
                await _repository.GetDashboardStatsAsync();

            return Ok(stats);
        }
        [HttpGet("dashboard/recent-transactions")]
        public async Task<IActionResult> GetRecentTransactions()
        {
            var transactions =
                await _repository.GetRecentTransactionsAsync();

            return Ok(transactions);
        }
    }
}