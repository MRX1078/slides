import React, { useState, useRef, useEffect } from 'react';
import { Send, X, CornerUpLeft, Clock, Loader } from 'react-feather';
import { addMessageToChat, getChatById } from './api';

const ChatBot = ({ onFileUpload, currentChatId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [currentReference, setCurrentReference] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && currentChatId) {
      const loadMessages = async () => {
        try {
          setIsLoading(true);
          const chat = await getChatById(currentChatId);
          const formattedMessages = (chat.messages || []).map(msg => ({
            id: msg.id,
            text: msg.message,
            isUser: true,
            timestamp: new Date(msg.created_at).toLocaleTimeString(),
            path: msg.path
          }));
          setMessages(formattedMessages);
  
         
          if (formattedMessages.length > 0 && onFileUpload) {
            const firstMessage = formattedMessages[formattedMessages.length - 1];
            if (firstMessage.path) {
              await onFileUpload(firstMessage.path);
            }
          }
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [inputValue]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentChatId || isLoading) return;
  
    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };
  
    try {
      setIsLoading(true);
      setIsWaitingForBot(true);
      setMessages(prev => [...prev, tempMessage]);
      setInputValue('');

      await addMessageToChat(currentChatId, currentReference, inputValue);
      
      const chat = await getChatById(currentChatId);
      const formattedMessages = (chat.messages || []).map(msg => ({
        id: msg.id,
        text: msg.message,
        isUser: true,
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
        path: msg.path
      }));

      setMessages(formattedMessages);
      setCurrentReference(null);
      setSelectedMessage(null);
      
      if (formattedMessages.length > 0 && onFileUpload) {
        const lastMsg = formattedMessages[formattedMessages.length - 1];
        if (lastMsg.path) {
          await onFileUpload(lastMsg.path);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setIsLoading(false);
      setIsWaitingForBot(false);
    }
  };
  
  const handleReferenceClick = async (messageId) => {
    if (!currentChatId || isLoading) return;
    
    try {
      setIsLoading(true);
      const referencedMessage = messages.find(msg => msg.id === messageId);
      
      if (referencedMessage?.path) {
        if (onFileUpload) {
          await onFileUpload(referencedMessage.path);
        }
        setCurrentReference(messageId);
        setSelectedMessage(messageId);
      }
    } catch (error) {
      console.error('Failed to load reference:', error);
    } finally {
      setIsLoading(false);
    }
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
      {isWaitingForBot && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.2)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          pointerEvents: 'none'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '300px'
          }}>
            <Loader size={32} color="#1677ff" className="spin" />
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                Ожидайте ответа бота
              </div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                Идет обработка вашего запроса...
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1.5s linear infinite;
          }
        `}
      </style>

      {isOpen && (
        <div style={{
          width: '100%',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'white',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.7em',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                marginTop: '2px'
              }}>
                <Clock size={12} style={{ marginRight: '5px' }} />
                Обработка...
              </div>
            </div>
          )}

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
                    whiteSpace: 'pre-wrap',
                    position: 'relative',
                    border: selectedMessage === message.id 
                      ? '3px solid rgb(196, 26, 77)' 
                      : 'none',
                    boxShadow: selectedMessage === message.id
                      ? '0 0 0 2px rgba(196, 26, 77, 0.3)'
                      : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {message.isUser && (
                    <button
                      onClick={() => handleReferenceClick(message.id)}
                      style={{
                        position: 'absolute',
                        left: '-25px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: currentChatId ? 1 : 0.5
                      }}
                      title="Ссылаться на это сообщение"
                    >
                      <CornerUpLeft 
                        size={16} 
                        color={selectedMessage === message.id ? '#52c41a' : '#666'} 
                      />
                    </button>
                  )}
                  
                  <div>{message.text}</div>
                  {message.path && (
                    <div style={{ 
                      marginTop: '4px',
                      fontSize: '0.8em',
                      opacity: 0.8
                    }}>
                      📄 Прикрепленная презентация
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

          {/* ФИНАЛЬНАЯ ВЕРСИЯ ПОЛЯ ВВОДА */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: 'white'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px'
            }}>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={currentChatId ? "Введите сообщение..." : "Выберите чат..."}
                disabled={!currentChatId || isLoading}
                style={{
                  flex: 1,
                  minHeight: '40px',
                  maxHeight: '150px',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  overflowY: 'auto',
                  boxSizing: 'border-box'
                }}
                rows={1}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || !currentChatId || isLoading}
                style={{
                  flexShrink: 0,
                  background: !inputValue.trim() || !currentChatId || isLoading ? '#ccc' : '#1677ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: !inputValue.trim() || !currentChatId || isLoading ? 'not-allowed' : 'pointer',
                  marginBottom: '2px'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
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
            position: 'relative',
            transition: 'transform 0.2s ease',
            ':hover': {
              transform: 'scale(1.05)'
            }
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