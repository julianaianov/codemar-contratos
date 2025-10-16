'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  SparklesIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  confidence?: number;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatWidget({ isOpen, onToggle }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatType, setChatType] = useState<'general' | 'contracts' | 'minutas'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar histórico do localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('ai-chat-history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Erro ao carregar histórico do chat:', error);
      }
    }
  }, []);

  // Salvar mensagens no localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          chatType: chatType,
          conversationHistory: messages
        }),
      });
      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.success ? data.result.answer : 'Desculpe, ocorreu um erro ao processar sua mensagem.',
        timestamp: new Date(),
        confidence: data.success ? data.result.confidence : 0
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date(),
        confidence: 0
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('ai-chat-history');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggle}
          className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
          title="Abrir Chat IA"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
          {messages.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-purple-500 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5" />
          <h3 className="font-semibold">Chat IA CODEMAR</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-1 hover:bg-purple-600 rounded transition-colors duration-200"
            title="Limpar conversa"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-purple-600 rounded transition-colors duration-200"
            title="Fechar chat"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat Type Selector */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex gap-1">
          <button
            onClick={() => setChatType('general')}
            className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
              chatType === 'general'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
            }`}
          >
            Geral
          </button>
          <button
            onClick={() => setChatType('contracts')}
            className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
              chatType === 'contracts'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
            }`}
          >
            Contratos
          </button>
          <button
            onClick={() => setChatType('minutas')}
            className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
              chatType === 'minutas'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
            }`}
          >
            Minutas
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Olá! 👋
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Como posso ajudá-lo hoje?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setInputMessage('Quais são os maiores contratos por valor?')}
                className="block w-full text-left p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                💰 Quais são os maiores contratos por valor?
              </button>
              <button
                onClick={() => setInputMessage('Qual minuta usar para acordo de cooperação?')}
                className="block w-full text-left p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                📄 Qual minuta usar para acordo de cooperação?
              </button>
              <button
                onClick={() => setInputMessage('Analise as tendências dos contratos')}
                className="block w-full text-left p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                📊 Analise as tendências dos contratos
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.type === 'ai' && message.confidence !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      message.confidence >= 80 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : message.confidence >= 60
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {message.confidence}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <ArrowPathIcon className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  IA está pensando...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
