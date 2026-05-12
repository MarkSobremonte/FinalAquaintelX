<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include 'db.php';

$sql = "SELECT * FROM water_quality ORDER BY created_at DESC LIMIT 1";
$result = $conn->query($sql);

if ($row = $result->fetch_assoc()) {
    echo json_encode($row);
} else {
    echo json_encode(["message" => "No data"]);
}
?>