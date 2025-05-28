const db = require("../db");

exports.getAllProducts = (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    return res.status(200).json(result);
  });
};

exports.getProductById = (req, res) => {
  const id = Number(req.params.id);
  const sql = "SELECT * FROM products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (result.length === 0)
      return res.status(404).json({ message: "Not found!" });
    return res.status(200).json(result[0]);
  });
};

exports.createProduct = (req, res) => {
  const { product_name, description, price, quantity } = req.body;
  if (!product_name || !description || !price || !quantity)
    return res.status(400).json({ message: "All fields are required" });
  const sql =
    "INSERT INTO products (product_name, description, price, quantity) VALUES (?,?,?,?)";
  db.query(sql, [product_name, description, price, quantity], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    return res.status(200).json({ message: "Product inserted successfully!" });
  });
};

exports.deleteProduct = (req, res) => {
  const id = Number(req.params.id);
  const sql = "DELETE FROM products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ message: "Products deleted successfully!" });
  });
};

exports.updateProduct = (req, res) => {
  const id = Number(req.params.id);
  const { product_name, description, price, quantity } = req.body;
  if (!product_name || !description || !price || !quantity) {
    return res.status(400).json({ message: "All field are required!" });
  }
  const sql =
    "UPDATE products SET product_name = ? description = ? price = ? quantity = ? WHERE id = ?";
  db.query(
    sql,
    [product_name, description, price, quantity, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Product not found!" });
      }
      return res.status(200).json({ message: "Product has been updated" });
    }
  );
};
