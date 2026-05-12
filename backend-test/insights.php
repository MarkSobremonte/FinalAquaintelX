<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include 'db.php';

$sql = "SELECT * FROM water_quality ORDER BY created_at DESC LIMIT 1";
$result = $conn->query($sql);
$row = $result->fetch_assoc();

$message = "System Ready";

if (!$row) {
    $message = "Waiting for data...";
} else {
    if ($row['ph'] < 6.5 || $row['ph'] > 8.5) {
        $message = "Warning: pH level abnormal!";
    } elseif ($row['tds'] > 500) {
        $message = "Warning: High TDS detected!";
    } elseif ($row['turbidity'] > 5) {
        $message = "Warning: High turbidity!";
    } else {
        $message = "Water quality is normal.";
    }
}

echo json_encode(["insight" => $message]);
?>