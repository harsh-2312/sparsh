<?php
/**
 * Copy this file to  mail-config.php  (same folder) and fill your details.
 * 1) hPanel -> Emails -> create a mailbox, e.g. info@sparshcarrybags.in
 * 2) Put its address + password below. Keep this file private.
 */
return [
    'host'   => 'smtp.hostinger.com',
    'port'   => 465,                       // 465 = SSL (recommended). 587 = TLS: set 'secure' => 'tls'
    'secure' => 'ssl',
    'user'   => 'info@sparshcarrybags.in', // the mailbox you created
    'pass'   => 'PUT-MAILBOX-PASSWORD-HERE',
    'from'   => 'info@sparshcarrybags.in', // must be the same mailbox
];
