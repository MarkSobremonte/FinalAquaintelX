<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - AquaIntelX</title>
    <!-- Use Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Phosphor Icons -->
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <link rel="stylesheet" href="style.css">
    <style>
        /* Inline specific login styles */
        .login-page {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: radial-gradient(circle at top right, rgba(0, 229, 255, 0.1), transparent 50%),
                        radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.1), transparent 50%),
                        var(--bg-main);
        }
        
        [data-theme="light"] .login-page {
            background: radial-gradient(circle at top right, rgba(14, 165, 233, 0.1), transparent 50%),
                        radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.1), transparent 50%),
                        var(--bg-main);
        }

        .login-wrapper {
            width: 100%;
            max-width: 440px;
            padding: 24px;
            z-index: 1;
        }

        .login-header {
            text-align: center;
            margin-bottom: 32px;
        }

        .login-header .brand-large {
            justify-content: center;
            margin-bottom: 16px;
        }

        .login-header p {
            color: var(--text-muted);
            font-size: 15px;
        }
        
        .login-form .form-group {
            margin-bottom: 20px;
        }

        .login-form .btn-primary {
            width: 100%;
            justify-content: center;
            padding: 14px;
            font-size: 16px;
            margin-top: 12px;
        }

        .form-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 8px;
            font-size: 14px;
            color: var(--text-muted);
        }

        .form-footer a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
        }
        
        .form-footer a:hover {
            text-decoration: underline;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }

        .checkbox-group input {
            cursor: pointer;
            accent-color: var(--primary);
            width: 16px;
            height: 16px;
        }

        @media (max-width: 480px) {
            .panel {
                padding: 24px !important;
            }
            .login-header .brand-text {
                font-size: 28px;
            }
        }
    </style>
</head>
<body class="login-page">
    <div class="login-wrapper">
        <div class="panel">
            <div class="login-header">
                <div class="brand-large">
                    <i class="ph ph-waves brand-icon" style="color: var(--primary);"></i>
                    <span class="brand-text">AquaIntelX</span>
                </div>
                <p>Sign in to access real-time telemetry</p>
            </div>
            
 <form class="login-form" id="loginForm">

    <div class="form-group">
        <label>Email Address</label>
        <input type="email" id="email" required>
    </div>

    <div class="form-group">
        <label>Password</label>
        <input type="password" id="password" required>
    </div>

    <button type="submit" class="btn btn-primary">
        Login
    </button>

</form>
        </div>
    </div>

<script>
document.getElementById("loginForm")
.addEventListener("submit", async function(e){

    e.preventDefault();

    const formData = new FormData();

    formData.append("email",
        document.getElementById("email").value);

    formData.append("password",
        document.getElementById("password").value);

    const response = await fetch(
        "auth_login.php",
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if(data.status === "success"){

        window.location.href = "index.php";

    } else {

        alert(data.message);
    }
});
</script>
</body>
</html>
