<?php

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["temperature"]) || !isset($data["turbidity"]) || !isset($data["tds"]) || !isset($data["ph"])) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required data fields"
    ]);
    exit;
}

$temp = (float)$data["temperature"];
$turb = (float)$data["turbidity"];
$tds  = (float)$data["tds"];
$ph   = (float)$data["ph"];

$stmt = $conn->prepare("INSERT INTO water_quality (temperature, turbidity, tds, ph) VALUES (?, ?, ?, ?)");
$stmt->bind_param("dddd", $temp, $turb, $tds, $ph);

if($stmt->execute()){
    echo json_encode([
        "status" => "success"
    ]);
}else{
    echo json_encode([
        "status" => "error",
        "message" => "Failed to insert data: " . $stmt->error
    ]);
}

$stmt->close();

?>