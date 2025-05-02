import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, ChevronLeft, ChevronRight } from 'react-feather';
import { getChatList, createChat } from './api';

const ChatHistory = ({ 
  chats, 
  setChats, 
  currentChatId, 
  setCurrentChatId,
  instanceRef
}) => {
  const [newChatTitle, setNewChatTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [presentation, setPresentation] = useState(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chatList = await getChatList();
        setChats(chatList);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    };
    fetchChats();
  }, [setChats]);

  const handleCreateChat = async () => {
    if (!newChatTitle.trim() || !presentation) return;
    
    try {
      setIsCreating(true);
      // Вызываем createChat с правильными аргументами
      const newChat = await createChat(newChatTitle, presentation);
      
      setChats(prev => [...prev, newChat]);
      setCurrentChatId(newChat.id);
      setNewChatTitle('');
      setPresentation(null);
      setIsCreating(false);  // Явно закрываем форму после успеха
    } catch (error) {
      console.error('Failed to create chat:', error);
      setIsCreating(false);  // Сброс даже при ошибке
      // Показываем ошибку пользователю (например, через alert/toast)
      alert('Не удалось создать чат: ' + error.message);
    }
  };

  const historyContainerStyle = {
    position: 'fixed',
    left: isHistoryVisible ? '10px' : '-310px', // Скрываем за пределами экрана
    top: '200px',
    bottom: '20px',
    width: '300px',
    height: '745px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    overflow: 'hidden',
    transition: 'left 0.3s ease-in-out'
  };

  // Стиль для кнопки переключения
  const toggleButtonStyle = {
    position: 'fixed',
    left: '17px',
    bottom: '27px',
    background: '#1677ff',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 1001
  };

  const loadChat = async (chatId) => {
    setCurrentChatId(chatId);
    // Здесь должна быть логика загрузки презентации для выбранного чата
    if (instanceRef.current) {
      // Загрузка документа для выбранного чата
      // instanceRef.current.UI.loadDocument(...);
    }
  };

  return (<>
    <div style={historyContainerStyle
    }>
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0 }}>Мои чаты</h3>
        <button
          onClick={() => setIsCreating(!isCreating)}
          style={{
            background: '#1677ff',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
        </button>
      </div>

      {isCreating && (
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <input
            type="text"
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            placeholder="Название чата"
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              outline: 'none'
            }}
          />
          <label 
  htmlFor="presentation_upload"
  style={{
    padding: '8px 12px',
    background: '#1677ff',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'center'
  }}
>
  Выберите файл
</label>
<input 
  type="file"
  id="presentation_upload"
  accept=".pptx"
  onChange={(e) => setPresentation(e.target.files[0])}
  style={{ display: 'none' }}
/>
{presentation && (
  <div style={{ marginTop: 4 ,fontSize:"10px"}}>
    Выбран: {presentation.name}
  </div>
)}
          <button
            onClick={handleCreateChat}
            disabled={!newChatTitle.trim() || isCreating}
            style={{
              padding: '8px 12px',
              background: '#1677ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isCreating ? 'Создание...' : 'Создать чат'}
          </button>
        </div>
      )}

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 0'
      }}>
        {chats.map(chat => (
          <div
            key={chat.id}
            onClick={() => loadChat(chat.id)}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              backgroundColor: currentChatId === chat.id ? '#f0f7ff' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderLeft: currentChatId === chat.id ? '3px solid #1677ff' : '3px solid transparent'
            }}
          >
            <MessageSquare size={16} color="#666" />
            <div style={{
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {chat.title}
            </div>
            <div style={{
              fontSize: '0.8em',
              color: '#999'
            }}>
              {new Date(chat.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
    <button
        style={toggleButtonStyle}
        onClick={() => setIsHistoryVisible(!isHistoryVisible)}
        title={isHistoryVisible ? 'Скрыть историю' : 'Показать историю'}
      >
        {isHistoryVisible ? (
          <ChevronLeft size={24} />
        ) : (
          <ChevronRight size={24} />
        )}
      </button>
    </>
  );
};

export default ChatHistory;