<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $email = $_POST['email'];
    $password = $_POST['password'];

    $sql = "SELECT * FROM users WHERE email='$email'";
    $result = mysqli_query($conn, $sql);

    if(mysqli_num_rows($result) > 0){

        $user = mysqli_fetch_assoc($result);

        if(password_verify($password, $user['password'])){

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];

            echo json_encode([
                "status" => "success"
            ]);

        } else {

            echo json_encode([
                "status" => "error",
                "message" => "Wrong Password"
            ]);
        }

    } else {

        echo json_encode([
            "status" => "error",
            "message" => "User not found"
        ]);
    }
}
?>