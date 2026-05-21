<?php
include 'db.php';

$sql = "SELECT * FROM sensor_logs ORDER BY id DESC LIMIT 1";
$result = mysqli_query($conn, $sql);

$row = mysqli_fetch_assoc($result);

echo json_encode($row);

?>