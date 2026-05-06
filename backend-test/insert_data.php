<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$temperature = $data['temperature'];
$turbidity   = $data['turbidity'];
$tds         = $data['tds'];
$ph          = $data['ph'];

$sql = "INSERT INTO water_quality (temperature, turbidity, tds, ph)
        VALUES ('$temperature', '$turbidity', '$tds', '$ph')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}
?>