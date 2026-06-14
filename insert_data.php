<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

require_once "config.php";

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "saved" => false,
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit;
}

/* Create system status table automatically if missing */
$conn->query("
    CREATE TABLE IF NOT EXISTS system_status (
        id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
        system_state ENUM('READING','FLUSHING','REFILLING','SETTLING','ERROR') NOT NULL DEFAULT 'READING',
        message VARCHAR(255) NOT NULL DEFAULT 'Showing real-time water data',
        seconds_remaining INT UNSIGNED NOT NULL DEFAULT 900,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
");

$conn->query("
    INSERT INTO system_status
    (id, system_state, message, seconds_remaining)
    VALUES
    (1, 'READING', 'Showing real-time water data', 900)
    ON DUPLICATE KEY UPDATE id = id
");

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    $input = $_POST;
}

/* Receive system_state from ESP32 or PowerShell */
$incoming_state = strtoupper(trim($input["system_state"] ?? ""));

if ($incoming_state !== "") {
    $incoming_message = trim($input["message"] ?? "System running");
    $incoming_seconds = max(0, intval($input["seconds_remaining"] ?? 0));

    $allowed_states = ["READING", "FLUSHING", "REFILLING", "SETTLING", "ERROR"];

    if (in_array($incoming_state, $allowed_states)) {
        $statusStmt = $conn->prepare("
            INSERT INTO system_status
            (id, system_state, message, seconds_remaining)
            VALUES
            (1, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                system_state = VALUES(system_state),
                message = VALUES(message),
                seconds_remaining = VALUES(seconds_remaining)
        ");

        $statusStmt->bind_param(
            "ssi",
            $incoming_state,
            $incoming_message,
            $incoming_seconds
        );

        $statusStmt->execute();
        $statusStmt->close();
    }
}

/* Read current system state */
$current_state = "READING";

$statusResult = $conn->query("
    SELECT system_state
    FROM system_status
    WHERE id = 1
    LIMIT 1
");

if ($statusResult && $statusResult->num_rows > 0) {
    $row = $statusResult->fetch_assoc();
    $current_state = strtoupper($row["system_state"] ?? "READING");
}

/* IMPORTANT: Do not save sensor data unless READING */
if ($current_state !== "READING") {
    echo json_encode([
        "status" => "success",
        "saved" => false,
        "system_state" => $current_state,
        "message" => "Sensor data ignored because system is currently " . $current_state
    ]);
    $conn->close();
    exit;
}

/* Sensor values */
$sensor_node = $input["sensor_node"] ?? "NODE-01";

$ph = floatval($input["ph"] ?? 0);
$temperature = floatval($input["temperature"] ?? 0);
$turbidity = floatval($input["turbidity"] ?? 0);
$tds = floatval($input["tds"] ?? 0);

if ($ph == 0 && $temperature == 0 && $turbidity == 0 && $tds == 0) {
    echo json_encode([
        "status" => "error",
        "saved" => false,
        "system_state" => $current_state,
        "message" => "No valid sensor data received"
    ]);
    $conn->close();
    exit;
}

/* Call Flask AI API */
$aiData = [
    "ph" => $ph,
    "temperature" => $temperature,
    "turbidity" => $turbidity,
    "tds" => $tds
];

$ch = curl_init("http://127.0.0.1:5000/predict");

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($aiData));
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$aiResponse = curl_exec($ch);

if (curl_errno($ch)) {
    $risk_level = "Unknown";
    $confidence = 0;
    $ai_confidence_status = "AI API Offline";
} else {
    $ai = json_decode($aiResponse, true);

    $risk_level = $ai["risk_level"] ?? "Unknown";
    $confidence = floatval($ai["confidence"] ?? 0);
    $ai_confidence_status = $ai["status"] ?? "Unknown";
}

curl_close($ch);

/* Map AI risk to status column */
$sensor_status = "normal";

if ($risk_level === "Moderate Risk") {
    $sensor_status = "warning";
}

if ($risk_level === "Critical Risk") {
    $sensor_status = "critical";
}

/* Save to database only during READING */
$stmt = $conn->prepare("
    INSERT INTO sensor_readings
    (
        sensor_node,
        temperature,
        turbidity,
        tds,
        ph,
        status,
        risk_level,
        confidence,
        ai_confidence_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "sddddssds",
    $sensor_node,
    $temperature,
    $turbidity,
    $tds,
    $ph,
    $sensor_status,
    $risk_level,
    $confidence,
    $ai_confidence_status
);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "saved" => true,
        "system_state" => $current_state,
        "message" => "Sensor data saved because system is READING",
        "sensor_node" => $sensor_node,
        "ph" => $ph,
        "temperature" => $temperature,
        "turbidity" => $turbidity,
        "tds" => $tds,
        "sensor_status" => $sensor_status,
        "risk_level" => $risk_level,
        "confidence" => $confidence,
        "ai_confidence_status" => $ai_confidence_status
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "saved" => false,
        "system_state" => $current_state,
        "message" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>