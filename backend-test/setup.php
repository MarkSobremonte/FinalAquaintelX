<?php

include "db.php";

// Create users table if not exists
$conn->query("CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
)");

// Create water_quality table if not exists
$conn->query("CREATE TABLE IF NOT EXISTS water_quality (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temperature FLOAT,
    turbidity FLOAT,
    tds FLOAT,
    ph FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// Insert default admin user if not exists
$stmt = $conn->prepare("INSERT IGNORE INTO users (email, password) VALUES (?, ?)");
$stmt->bind_param("ss", $email, $password);
$email = "admin@aquaintelx.com";
$password = "admin123"; // Change this to a secure password
$stmt->execute();
$stmt->close();

echo json_encode(["status" => "success", "message" => "Database setup complete. Default login: admin@aquaintelx.com / admin123"]);

?>