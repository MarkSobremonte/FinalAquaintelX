<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include 'db.php';

$sql = "SELECT * FROM water_quality 
        WHERE created_at >= NOW() - INTERVAL 1 DAY
        ORDER BY created_at ASC";

$result = $conn->query($sql);

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>