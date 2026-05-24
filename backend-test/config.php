<?php
// ============================================================
// config.php — Database & App Configuration
// Place this file OUTSIDE your public web root if possible,
// e.g. one level up from your project folder. Then require it
// with: require_once '../config.php';
// If you must keep it inside the project, protect it via
// .htaccess (see comment at bottom of this file).
// ============================================================

// ── Database ──────────────────────────────────────────────
define('DB_HOST',     'localhost');   // Laragon default
define('DB_PORT',     3307);          // MySQL default port
define('DB_NAME',     'aquaintelx');
define('DB_USER',     'root');        // Laragon default user
define('DB_PASS',     'paul');            // Laragon default: empty password
define('DB_CHARSET',  'utf8mb4');

// ── Application ───────────────────────────────────────────
define('APP_NAME',    'AquaIntelX');
define('APP_URL',     'http://localhost/aquaintelx');  // adjust if your folder name differs

// ── Hardware / IoT API Key ────────────────────────────────
// Used by hardware_push.php — your ESP32/Arduino sends this in X-Api-Key header.
define('SENSOR_API_KEY', 'change-this-secret-key-here');

// Session lifetime in seconds (8 hours)
define('SESSION_LIFETIME', 28800);

// ── PDO Connection Factory ────────────────────────────────
/**
 * Returns a shared PDO instance (singleton pattern).
 * Throws PDOException on connection failure.
 */
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
        );
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    }
    return $pdo;
}

// ── Session hardening ─────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => SESSION_LIFETIME,
        'path'     => '/',
        'secure'   => false,   // set true if using HTTPS
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

/*
 * .htaccess protection — add this to your project root .htaccess
 * to block direct HTTP access to config.php:
 *
 *   <Files "config.php">
 *       Require all denied
 *   </Files>
 */
