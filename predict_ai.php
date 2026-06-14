<?php

header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode([
        "status" => "error",
        "message" => "No JSON received. Use POST request with ph, temperature, turbidity, and tds."
    ]);
    exit;
}

$required = ["ph", "temperature", "turbidity", "tds"];

foreach ($required as $field) {
    if (!isset($input[$field])) {
        echo json_encode([
            "status" => "error",
            "message" => "Missing field: $field"
        ]);
        exit;
    }
}

$data = [
    "ph" => floatval($input["ph"]),
    "temperature" => floatval($input["temperature"]),
    "turbidity" => floatval($input["turbidity"]),
    "tds" => floatval($input["tds"])
];

$ch = curl_init("http://127.0.0.1:5000/predict");

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode([
        "status" => "error",
        "message" => curl_error($ch)
    ]);
    exit;
}

curl_close($ch);

echo $response;