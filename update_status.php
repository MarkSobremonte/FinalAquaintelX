<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

require_once "config.php";

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    $input = $_POST;
}

$system_state = strtoupper(trim($input["system_state"] ?? "READING"));
$message = trim($input["message"] ?? "System running");
$seconds_remaining = intval($input["seconds_remaining"] ?? 0);

$allowed_states = ["READING", "FLUSHING", "REFILLING", "SETTLING", "ERROR"];

if (!in_array($system_state, $allowed_states)) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid system_state"
    ]);
    exit;
}

$stmt = $conn->prepare("
    INSERT INTO system_status
    (id, system_state, message, seconds_remaining)
    VALUES
    (1, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        system_state = VALUES(system_state),
        message = VALUES(message),
        seconds_remaining = VALUES(seconds_remaining)
");

$stmt->bind_param(
    "ssi",
    $system_state,
    $message,
    $seconds_remaining
);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "system_state" => $system_state,
        "message" => $message,
        "seconds_remaining" => $seconds_remaining
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>