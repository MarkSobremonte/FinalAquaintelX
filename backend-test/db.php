<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli(
    "localhost",
    "root",
    "",
    "aquaintelx_db"
);

if($conn->connect_error){
    die(json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]));
}

?>
