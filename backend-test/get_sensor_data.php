<?php
include "db.php";

$sql = "SELECT * FROM sensor_logs
ORDER BY id DESC LIMIT 1";

$result = $conn->query($sql);

echo json_encode(
    $result->fetch_assoc()
);
?>