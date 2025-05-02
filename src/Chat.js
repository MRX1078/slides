import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, X } from 'react-feather';
import { addMessageToChat, getChatById } from './api';

const ChatBot = ({ onFileUpload, currentChatId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Загрузка сообщений при смене чата или открытии чата
  useEffect(() => {
    if (isOpen && currentChatId) {
      const loadMessages = async () => {
        try {
          setIsLoading(true);
          const chat = await getChatById(currentChatId);
          const formattedMessages = (chat.messages || []).map(msg => ({
            id: msg.id,
            text: msg.message,
            isUser: true, // Предполагаем, что все сообщения от пользователя
            timestamp: new Date(msg.created_at).toLocaleTimeString(),
            path: msg.path // Дополнительные данные о файле, если есть
          }));
          setMessages(formattedMessages);
        } catch (error) {
          console.error('Failed to load messages:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadMessages();
    } else if (!currentChatId) {
      setMessages([]);
    }
  }, [currentChatId, isOpen]);

  // Автоскролл к новым сообщениям
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentChatId || isLoading) return;
  
    // Объявляем tempMessage перед try-catch
    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };
  
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, tempMessage]);
      setInputValue('');
  
      await addMessageToChat(currentChatId, null, inputValue);
      
      const chat = await getChatById(currentChatId);
      const formattedMessages = (chat.messages || []).map(msg => ({
        id: msg.id,
        text: msg.message,
        isUser: true,
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
        path: msg.path
      }));
  
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentChatId) return;
  
    const file = files[0];
    
    // Объявляем uploadMessage перед try-catch
    const uploadMessage = {
      id: `upload-${Date.now()}`,
      text: `Загружаем файл: ${file.name}`,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
      file
    };
  
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, uploadMessage]);
  
      if (onFileUpload) {
        await onFileUpload(file);
      }
  
      setMessages(prev => prev.map(msg => 
        msg.id === uploadMessage.id 
          ? { ...msg, text: `Загружен файл: ${file.name}` }
          : msg
      ));
    } catch (error) {
      console.error('File upload failed:', error);
      setMessages(prev => prev.filter(msg => msg.id !== uploadMessage.id));
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      width: '350px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end'
    }}>
      {isOpen && (
        <div style={{
          width: '100%',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Заголовок чата */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#1677ff',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0 }}>ДИТ - Презентации</h3>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Область сообщений */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {!currentChatId ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: '#666'
              }}>
                Выберите чат из списка слева или создайте новый
              </div>
            ) : isLoading && messages.length === 0 ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: '#666'
              }}>
                Загрузка сообщений...
              </div>
            ) : messages.length === 0 ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: '#666'
              }}>
                Нет сообщений. Начните общение!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    alignSelf: message.isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: message.isUser 
                      ? '12px 12px 0 12px' 
                      : '12px 12px 12px 0',
                    backgroundColor: message.isUser ? '#1677ff' : '#f0f0f0',
                    color: message.isUser ? 'white' : 'black',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  <div>{message.text}</div>
                  {message.file && (
                    <div style={{ 
                      marginTop: '4px',
                      fontSize: '0.8em',
                      opacity: 0.8
                    }}>
                      📄 {message.file.name}
                    </div>
                  )}
                  {message.path && !message.file && (
                    <div style={{ 
                      marginTop: '4px',
                      fontSize: '0.8em',
                      opacity: 0.8
                    }}>
                      📄 Прикрепленный файл
                    </div>
                  )}
                  <div style={{
                    fontSize: '0.7em',
                    textAlign: 'right',
                    marginTop: '4px',
                    opacity: 0.7
                  }}>
                    {message.timestamp}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Поле ввода */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: '8px',
            position: 'relative'
          }}>
            {isLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: '#1677ff',
                animation: 'loading 1.5s infinite'
              }} />
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".ppt,.pptx"
              style={{ display: 'none' }}
              disabled={!currentChatId || isLoading}
            />
            <button
              onClick={triggerFileInput}
              disabled={!currentChatId || isLoading}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: currentChatId ? 1 : 0.5
              }}
            >
              <Paperclip size={20} color="#666" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentChatId ? "Введите сообщение..." : "Выберите чат..."}
              disabled={!currentChatId || isLoading}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                outline: 'none',
                opacity: currentChatId ? 1 : 0.7
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !currentChatId || isLoading}
              style={{
                background: !inputValue.trim() || !currentChatId || isLoading ? '#ccc' : '#1677ff',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !inputValue.trim() || !currentChatId || isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Кнопка открытия чата */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: '#1677ff',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            position: 'relative'
          }}
        >
          💬
          {currentChatId && messages.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: 'red',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>
              {messages.length}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default ChatBot;