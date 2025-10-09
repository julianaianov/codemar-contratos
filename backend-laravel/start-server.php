<?php
// Configurar limites do PHP
ini_set('upload_max_filesize', '25M');
ini_set('post_max_size', '25M');
ini_set('max_execution_time', 300);
ini_set('max_input_time', 300);
ini_set('memory_limit', '256M');

// Executar o servidor Laravel
passthru('php artisan serve --host=0.0.0.0 --port=8000');
?>

