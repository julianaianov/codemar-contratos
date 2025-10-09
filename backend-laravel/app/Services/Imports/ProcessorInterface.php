<?php

namespace App\Services\Imports;

use App\Models\FileImport;

interface ProcessorInterface
{
    /**
     * Processa o arquivo de importação
     */
    public function process(FileImport $fileImport): void;
}

