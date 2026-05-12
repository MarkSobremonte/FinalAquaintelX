<?php

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["email"]) || !isset($data["password"])) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid input data"
    ]);
    exit;
}

$email = $data["email"];
$password = $data["password"];

$stmt = $conn->prepare("SELECT * FROM users WHERE email=? AND password=?");
$stmt->bind_param("ss", $email, $password);
$stmt->execute();
$result = $stmt->get_result();

if($result->num_rows > 0){
    echo json_encode([
        "status" => "success"
    ]);
}else{
    echo json_encode([
        "status" => "error",
        "message" => "Invalid credentials"
    ]);
}

$stmt->close();

?>