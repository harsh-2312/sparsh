<?php
/**
 * SPARSH Carry Bags - enquiry form mailer.
 * Receives the website form (JSON) and emails it to the business inbox.
 * Works on normal PHP hosting (Hostinger etc.) with the built-in mail().
 *
 * EDIT ONLY THESE TWO LINES IF NEEDED:
 */
$TO_EMAIL  = 'sparshcarrybags@gmail.com';   // where enquiries arrive
$FROM_NAME = 'SPARSH Website';
/*
 * RELIABLE DELIVERY (recommended on Hostinger):
 * Copy _data/mail-config.sample.php to _data/mail-config.php and fill in the
 * mailbox you created in hPanel -> Emails. Without it the script falls back to
 * PHP mail(), which Hostinger often drops silently.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function out($ok, $error = null, $code = 200) {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'error' => $error]);
    exit;
}
function clean($v, $max = 500) {
    $v = is_string($v) ? $v : '';
    $v = trim(preg_replace('/[\r\n\t]+/', ' ', $v));      // single line: blocks header injection
    return mb_substr($v, 0, $max);
}


/** Tiny SMTP client (no libraries). Returns [true,''] or [false,'reason']. */
function smtp_send(array $c, $to, $subject, $body, $replyTo, $fromName) {
    $host = $c['host']; $port = (int)($c['port'] ?? 465); $sec = $c['secure'] ?? ($port == 465 ? 'ssl' : 'tls');
    $errno = 0; $errstr = '';
    $fp = @stream_socket_client(($sec === 'ssl' ? 'ssl://' : 'tcp://') . "$host:$port", $errno, $errstr, 15);
    if (!$fp) return [false, "connect: $errstr"];
    stream_set_timeout($fp, 15);
    $read = function () use ($fp) {
        $r = '';
        while (($l = fgets($fp, 1024)) !== false) { $r .= $l; if (strlen($l) < 4 || $l[3] === ' ') break; }
        return $r;
    };
    $cmd = function ($line, $ok) use ($fp, $read) {
        if ($line !== null) fwrite($fp, $line . "\r\n");
        $r = $read();
        return [strpos($r, (string)$ok) === 0, trim($r)];
    };
    [$ok, $r] = $cmd(null, 220); if (!$ok) return [false, "greeting: $r"];
    [$ok, $r] = $cmd('EHLO sparsh', 250); if (!$ok) return [false, "ehlo: $r"];
    if ($sec === 'tls') {
        [$ok, $r] = $cmd('STARTTLS', 220); if (!$ok) return [false, "starttls: $r"];
        if (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) return [false, 'tls failed'];
        [$ok, $r] = $cmd('EHLO sparsh', 250); if (!$ok) return [false, "ehlo2: $r"];
    }
    if (!empty($c['user'])) {
        [$ok, $r] = $cmd('AUTH LOGIN', 334); if (!$ok) return [false, "auth: $r"];
        [$ok, $r] = $cmd(base64_encode($c['user']), 334); if (!$ok) return [false, "user: $r"];
        [$ok, $r] = $cmd(base64_encode($c['pass']), 235); if (!$ok) return [false, "login failed: $r"];
    }
    $from = $c['from'] ?? $c['user'];
    [$ok, $r] = $cmd("MAIL FROM:<$from>", 250); if (!$ok) return [false, "from: $r"];
    [$ok, $r] = $cmd("RCPT TO:<$to>", 250); if (!$ok) return [false, "rcpt: $r"];
    [$ok, $r] = $cmd('DATA', 354); if (!$ok) return [false, "data: $r"];
    $h  = 'Date: ' . date('r') . "\r\n";
    $h .= 'From: ' . mb_encode_mimeheader($fromName) . " <$from>\r\n";
    $h .= "To: <$to>\r\n";
    if ($replyTo !== '') $h .= "Reply-To: $replyTo\r\n";
    $h .= 'Subject: =?UTF-8?B?' . base64_encode($subject) . "?=\r\n";
    $h .= 'Message-ID: <' . bin2hex(random_bytes(8)) . '@' . preg_replace('/[^a-z0-9.\-]/i', '', $host) . ">\r\n";
    $h .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n";
    $msg = $h . "\r\n" . chunk_split(base64_encode($body));
    fwrite($fp, $msg . "\r\n.\r\n");
    $r = $read();
    fwrite($fp, "QUIT\r\n"); fclose($fp);
    return strpos($r, '250') === 0 ? [true, ''] : [false, "send: " . trim($r)];
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 'POST only', 405);

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) $data = $_POST;

// Spam trap: real visitors never fill this hidden field.
if (!empty($data['website'])) out(true);

// Simple rate limit: max 5 enquiries per hour per IP.
$ip   = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$dir  = __DIR__ . '/_data';
if (!is_dir($dir)) @mkdir($dir, 0755, true);
$rl   = $dir . '/rl-' . md5($ip) . '.json';
$hits = [];
if (is_file($rl)) { $hits = json_decode(@file_get_contents($rl), true) ?: []; }
$hits = array_values(array_filter($hits, fn($t) => $t > time() - 3600));
if (count($hits) >= 5) out(false, 'Too many enquiries. Please try again later or use WhatsApp.', 429);

$name    = clean($data['name'] ?? '', 120);
$company = clean($data['company'] ?? '', 160);
$phone   = clean($data['phone'] ?? '', 40);
$email   = clean($data['email'] ?? '', 160);
$product = clean($data['product'] ?? '', 160);
$print   = clean($data['print'] ?? '', 40);
$qty     = clean((string)($data['quantity'] ?? ''), 20);
$size    = clean($data['size'] ?? '', 120);
$notes   = trim(mb_substr((string)($data['notes'] ?? ''), 0, 2000));

if (mb_strlen($name) < 2 || mb_strlen($company) < 2 || $phone === '' || $product === '' || $print === '' || !ctype_digit($qty) || (int)$qty < 1) {
    out(false, 'Please fill all required fields.', 422);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) out(false, 'Invalid email address.', 422);

$host   = preg_replace('/^www\./i', '', preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? 'sparshcarrybags.in'));
$host   = preg_replace('/[^a-z0-9.\-]/i', '', $host) ?: 'sparshcarrybags.in';
$from   = 'no-reply@' . $host;
$subject = 'New bulk enquiry - ' . $company . ' (' . $product . ')';

$lines = [
    'New enquiry from the SPARSH website',
    str_repeat('-', 38),
    "Name:               $name",
    "Business:           $company",
    "Phone / WhatsApp:   $phone",
    'Email:              ' . ($email !== '' ? $email : '(not given)'),
    "Product:            $product",
    "Plain or printed:   $print",
    "Estimated quantity: $qty",
    'Bag size:           ' . ($size !== '' ? $size : '(not given)'),
    '',
    'Requirements:',
    $notes !== '' ? $notes : '(none)',
    '',
    str_repeat('-', 38),
    'Sent: ' . date('d M Y, h:i A') . ' | IP: ' . $ip,
];
$body = implode("\r\n", $lines);

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= 'From: ' . mb_encode_mimeheader($FROM_NAME) . " <$from>\r\n";
if ($email !== '') $headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Safety copy on the server (blocked from the web by _data/.htaccess).
@file_put_contents($dir . '/enquiries.log', "[" . date('c') . "]\n" . $body . "\n\n", FILE_APPEND | LOCK_EX);

$sent = false; $why = '';
$cfgFile = $dir . '/mail-config.php';
if (is_file($cfgFile)) {
    $cfg = include $cfgFile;
    if (is_array($cfg) && !empty($cfg['host'])) {
        [$sent, $why] = smtp_send($cfg, $TO_EMAIL, $subject, $body, $email, $FROM_NAME);
    }
}
if (!$sent) {   // fallback: PHP mail()
    $sent = @mail($TO_EMAIL, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-f' . $from);
    if (!$sent && $why === '') $why = 'mail() refused';
}
if (!$sent) {
    @file_put_contents($dir . '/mail-errors.log', '[' . date('c') . "] $why\n", FILE_APPEND | LOCK_EX);
    out(false, 'Mail could not be sent.', 500);
}

$hits[] = time();
@file_put_contents($rl, json_encode($hits));
out(true);
