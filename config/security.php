<?php
/**
 * Security Configuration for Lumina PHP Application
 * This file centralizes all security settings
 */

// Set error reporting (logs to files, not displayed)
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', '/var/log/php/error.log');

// Session configuration
ini_set('session.name', 'LUMINA_SESSION');
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.gc_maxlifetime', 86400);
ini_set('session.gc_probability', '1');
ini_set('session.gc_divisor', '100');

// File upload security
ini_set('upload_max_filesize', '50M');
ini_set('post_max_size', '50M');
ini_set('upload_tmp_dir', '/tmp');
ini_set('file_uploads', '1');

// Disable dangerous functions
ini_set('disable_functions', 'exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source');

// Disable URL wrappers
ini_set('allow_url_fopen', '0');
ini_set('allow_url_include', '0');

// PHP information hiding
ini_set('expose_php', '0');

// Memory limits
ini_set('memory_limit', '256M');
ini_set('max_execution_time', '300');

// Type juggling security
ini_set('mbstring.func_overload', '0');

// Define security constants
define('APP_SECURITY_ENABLED', true);
define('APP_PRODUCTION', getenv('APP_ENV') === 'production');
define('APP_DEBUG', getenv('APP_ENV') !== 'production');
define('APP_BASE_PATH', dirname(__DIR__));
define('APP_PUBLIC_PATH', APP_BASE_PATH . '/public');

// CSRF token generation
if (!function_exists('generate_csrf_token')) {
    function generate_csrf_token() {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
}

// CSRF token verification
if (!function_exists('verify_csrf_token')) {
    function verify_csrf_token($token) {
        if (empty($_SESSION['csrf_token'])) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], $token);
    }
}

// Input sanitization
if (!function_exists('sanitize_input')) {
    function sanitize_input($data) {
        if (is_array($data)) {
            return array_map('sanitize_input', $data);
        }
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }
}

// Output escaping (for HTML context)
if (!function_exists('esc_html')) {
    function esc_html($text) {
        return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}

// Output escaping (for HTML attributes)
if (!function_exists('esc_attr')) {
    function esc_attr($text) {
        return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}

// Output escaping (for JavaScript)
if (!function_exists('esc_js')) {
    function esc_js($text) {
        return json_encode($text, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);
    }
}

// Secure random token generation
if (!function_exists('generate_secure_token')) {
    function generate_secure_token($length = 32) {
        return bin2hex(random_bytes($length));
    }
}

// Rate limiting helper
if (!function_exists('check_rate_limit')) {
    function check_rate_limit($key, $limit = 100, $window = 900) {
        $redis = getenv('REDIS_HOST') ? new Redis() : null;
        
        if ($redis) {
            $redis->connect(getenv('REDIS_HOST'), getenv('REDIS_PORT'));
            if (getenv('REDIS_PASSWORD')) {
                $redis->auth(getenv('REDIS_PASSWORD'));
            }
            
            $rate_key = "rate_limit:{$key}";
            $count = (int) $redis->get($rate_key);
            
            if ($count >= $limit) {
                http_response_code(429);
                return false;
            }
            
            $redis->incr($rate_key);
            $redis->expire($rate_key, $window);
            $redis->close();
        }
        
        return true;
    }
}

// Security headers
if (!function_exists('set_security_headers')) {
    function set_security_headers() {
        // Prevent MIME type sniffing
        header('X-Content-Type-Options: nosniff');
        
        // Disabled: CSP is the correct XSS defense; mode=block causes issues in IE
        header('X-XSS-Protection: 0');
        
        // Clickjacking protection
        header('X-Frame-Options: SAMEORIGIN');
        
        // Referrer policy
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Content Security Policy
        $csp = "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;";
        header('Content-Security-Policy: ' . $csp);
        
        // HSTS (only in production with HTTPS)
        if (APP_PRODUCTION && isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        }
        
        // Permissions Policy
        header('Permissions-Policy: geolocation=(self), microphone=(), camera=()');
        
        // Hide PHP version
        header_remove('X-Powered-By');
    }
}

// Call security headers on every request
set_security_headers();
