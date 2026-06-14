<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "config.php";

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]);
    exit;
}

$result = $conn->query("
    SELECT 
        system_state,
        message,
        seconds_remaining,
        updated_at
    FROM system_status
    WHERE id = 1
    LIMIT 1
");

if ($result && $result->num_rows > 0) {
    echo json_encode([
        "status" => "success",
        "data" => $result->fetch_assoc()
    ]);
} else {
    echo json_encode([
        "status" => "success",
        "data" => [
            "system_state" => "READING",
            "message" => "Showing real-time water data",
            "seconds_remaining" => 900,
            "updated_at" => date("Y-m-d H:i:s")
        ]
    ]);
}

$conn->close();
?>