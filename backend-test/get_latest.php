<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include "db.php";

$sql = "SELECT * FROM water_quality
        ORDER BY id DESC
        LIMIT 1";

$result = $conn->query($sql);

if($row = $result->fetch_assoc()){

    echo json_encode($row);

}else{

    echo json_encode([
        "temperature" => 0,
        "turbidity" => 0,
        "tds" => 0,
        "ph" => 0
    ]);
}

?>