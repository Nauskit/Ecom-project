const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authorizeRoles = require("../middleware/authorizeRoles");
const { authenticateToken, generateToken } = require("../middleware/jwt");

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.createProduct);
router.put("/:id", authorizeRoles("admin"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
