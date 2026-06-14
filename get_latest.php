<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "config.php";

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

$sql = "
        SELECT 
            id,
            sensor_node,
            temperature,
            turbidity,
            tds,
            ph,
            status,
            risk_level,
            confidence,
            ai_confidence_status,
            recorded_at
        FROM sensor_readings
        ORDER BY id DESC
        LIMIT 1
";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    echo json_encode([
        "status" => "success",
        "data" => $result->fetch_assoc()
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "No sensor data found"
    ]);
}

$conn->close();
?>