'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface DocxEditorProps {
  minutaId: string;
  minutaNome: string;
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  onClose: () => void;
}

export default function DocxEditor({ 
  minutaId, 
  minutaNome, 
  initialContent, 
  onSave, 
  onClose 
}: DocxEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    
    setIsSaving(true);
    try {
      await onSave(editorRef.current.innerHTML);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar minuta');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Editando: {minutaNome}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
            >
              <CheckIcon className="h-5 w-5" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center gap-1">
            <button
              onClick={() => execCommand('bold')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
              title="Negrito"
            >
              <BoldIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => execCommand('italic')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
              title="Itálico"
            >
              <ItalicIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => execCommand('underline')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
              title="Sublinhado"
            >
              <UnderlineIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
              title="Lista com marcadores"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
              title="Lista numerada"
            >
              <NumberedListIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => execCommand('justifyLeft')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
              title="Alinhar à esquerda"
            >
              <AlignLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => execCommand('justifyCenter')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
              title="Centralizar"
            >
              <AlignCenter className="h-5 w-5" />
            </button>
            <button
              onClick={() => execCommand('justifyRight')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
              title="Alinhar à direita"
            >
              <AlignRight className="h-5 w-5" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          <select
            onChange={(e) => execCommand('formatBlock', e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            title="Formato do parágrafo"
          >
            <option value="div">Parágrafo</option>
            <option value="h1">Título 1</option>
            <option value="h2">Título 2</option>
            <option value="h3">Título 3</option>
            <option value="h4">Título 4</option>
            <option value="h5">Título 5</option>
            <option value="h6">Título 6</option>
          </select>

          <select
            onChange={(e) => execCommand('fontSize', e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            title="Tamanho da fonte"
          >
            <option value="1">8px</option>
            <option value="2">10px</option>
            <option value="3">12px</option>
            <option value="4">14px</option>
            <option value="5">18px</option>
            <option value="6">24px</option>
            <option value="7">36px</option>
          </select>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            className="w-full h-full p-6 overflow-auto focus:outline-none prose prose-lg max-w-none dark:prose-invert"
            style={{ minHeight: '400px' }}
            suppressContentEditableWarning={true}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>ID: {minutaId}</span>
              <span>•</span>
              <span>Modo: Edição</span>
            </div>
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4" />
              <span>Editor de Documentos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

