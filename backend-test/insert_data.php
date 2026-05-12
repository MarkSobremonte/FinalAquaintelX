<?php

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$temp = $data["temperature"];
$turb = $data["turbidity"];
$tds  = $data["tds"];
$ph   = $data["ph"];

$sql = "INSERT INTO water_quality
        (temperature, turbidity, tds, ph)
        VALUES
        ('$temp','$turb','$tds','$ph')";

if($conn->query($sql)){

    echo json_encode([
        "status" => "success"
    ]);

}else{

    echo json_encode([
        "status" => "error"
    ]);

}

?>