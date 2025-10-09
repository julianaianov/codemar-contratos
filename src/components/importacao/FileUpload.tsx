'use client';

import React, { useState, useRef } from 'react';
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  acceptedFormats: string;
  fileType: 'xml' | 'excel' | 'csv' | 'pdf';
  onUploadSuccess?: (data: any) => void;
  disabled?: boolean;
  diretoria?: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default function FileUpload({ acceptedFormats, fileType, onUploadSuccess, disabled = false, diretoria }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      
      // Validar tamanho do arquivo (20MB = 20 * 1024 * 1024 bytes)
      const maxSize = 20 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setResult({
          success: false,
          message: 'Arquivo muito grande',
          error: `Arquivo tem ${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB. Tamanho máximo permitido: 20MB. Tente comprimir o PDF.`,
        });
        return;
      }
      
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validar tamanho do arquivo (20MB = 20 * 1024 * 1024 bytes)
      const maxSize = 20 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setResult({
          success: false,
          message: 'Arquivo muito grande',
          error: `Arquivo tem ${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB. Tamanho máximo permitido: 20MB. Tente comprimir o PDF.`,
        });
        return;
      }
      
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    if (diretoria) {
      formData.append('diretoria', diretoria);
    }

    try {
      const response = await fetch(`${API_URL}/api/imports`, {
        method: 'POST',
        body: formData,
        // Não definir Content-Type para FormData - o browser define automaticamente com boundary
        // Adicionar timeout para uploads grandes
        signal: AbortSignal.timeout(300000), // 5 minutos timeout
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message || 'Arquivo importado com sucesso!',
          data: data.data,
        });
        
        if (onUploadSuccess) {
          onUploadSuccess(data.data);
        }
      } else {
        // Mostrar erros de validação se houver
        let errorMessage = data.message || 'Erro desconhecido';
        if (data.errors) {
          const errorDetails = Object.values(data.errors).flat().join(', ');
          errorMessage = `${errorMessage}: ${errorDetails}`;
        }
        
        console.error('Erro na resposta:', data);
        setResult({
          success: false,
          message: 'Erro ao processar arquivo',
          error: errorMessage,
        });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      
      let errorMessage = 'Erro de conexão';
      if (error instanceof Error) {
        if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
          errorMessage = 'Upload demorou muito tempo. Arquivo pode ser muito grande. Tente comprimir o PDF.';
        } else if (error.message.includes('413')) {
          errorMessage = 'Arquivo muito grande. Tente comprimir o PDF para menos de 20MB.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Erro de rede. Verifique sua conexão e tente novamente.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setResult({
        success: false,
        message: 'Erro ao fazer upload do arquivo',
        error: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Área de Drop */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
          disabled
            ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 opacity-50'
            : dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
        } ${file ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : ''}`}
        onDragEnter={disabled ? undefined : handleDrag}
        onDragLeave={disabled ? undefined : handleDrag}
        onDragOver={disabled ? undefined : handleDrag}
        onDrop={disabled ? undefined : handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />

        {!file ? (
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Arraste e solte o arquivo aqui
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              ou clique para selecionar
            </p>
            <p className="text-xs text-gray-400">
              Formatos aceitos: {acceptedFormats}
            </p>
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DocumentIcon className="h-10 w-10 text-green-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
              title="Remover arquivo"
            >
              <XMarkIcon className="h-5 w-5 text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Botão de Upload */}
      {file && !result && (
        <button
          onClick={handleUpload}
          disabled={uploading || disabled}
          className={`mt-4 w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 ${
            uploading || disabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
          }`}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processando...
            </span>
          ) : (
            'Fazer Upload e Processar'
          )}
        </button>
      )}

      {/* Resultado */}
      {result && (
        <div
          className={`mt-4 p-6 rounded-lg ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
              : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
          }`}
        >
          <div className="flex items-start gap-4">
            {result.success ? (
              <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3
                className={`font-semibold mb-2 ${
                  result.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                }`}
              >
                {result.message}
              </h3>

              {result.success && result.data && (
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Arquivo:</strong> {result.data.original_filename}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Tipo:</strong> {result.data.file_type.toUpperCase()}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Status:</strong>{' '}
                    <span className="capitalize">{result.data.status}</span>
                  </p>
                  {result.data.total_records && (
                    <>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Total de registros:</strong> {result.data.total_records}
                      </p>
                      <p className="text-green-700 dark:text-green-300">
                        <strong>✓ Sucesso:</strong> {result.data.successful_records}
                      </p>
                      {result.data.failed_records > 0 && (
                        <p className="text-red-700 dark:text-red-300">
                          <strong>✗ Falhas:</strong> {result.data.failed_records}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {!result.success && result.error && (
                <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {result.error}
                </p>
              )}

              <button
                onClick={clearFile}
                className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                  result.success
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Importar Outro Arquivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

