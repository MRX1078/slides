import React, { useRef, useEffect, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import ChatBot from './Chat';
import ChatHistory from './ChatHistory';
import { getChatById } from './api';

const DEMO_KEY = 'demo:1745013500525:6109984103000000009e8b171f0d6c4fbb4c48ba7035f0a92d49bf9486';

function App() {
  const viewer = useRef(null);
  const instanceRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  // Добавим функцию для загрузки документа по URL
  const loadDocumentFromUrl = async (url) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const fileName = url.split('/').pop();
      setFileName(fileName);
      if (instanceRef.current) {
        instanceRef.current.UI.loadDocument(arrayBuffer, { filename: fileName });
      }
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
    }
  };

  // Эффект для загрузки презентации при изменении текущего чата

  useEffect(() => {
    if (viewer.current) viewer.current.innerHTML = '';

    WebViewer(
      {
        path: '/lib/webviewer',
        licenseKey: DEMO_KEY,
        initialDoc: '',
        enableAnnotations: false,
        enableOfficeEditing: false,
        fullAPI: true,
      },
      viewer.current
    ).then(instance => {
      instanceRef.current = instance;
      instance.UI.setHeaderItems(header => {
        header.update([{ type: 'spacer' }]);
      });
      instance.UI.setToolbarGroup('toolbarGroup-View');
      instance.UI.disableElements([
        'ribbons',
        'toolsHeader',
      ]);
      instance.UI.disableFeatures([
        instance.UI.Feature.Annotations,
        instance.UI.Feature.TextSelection,
        instance.UI.Feature.FilePicker,
        instance.UI.Feature.Print,
        instance.UI.Feature.Download
      ]);
    });

    return () => {
      if (viewer.current) viewer.current.innerHTML = '';
    };
  }, []);

  const handleFileFromChat = async (fileOrPath) => {
    if (!instanceRef.current) return;
  
    try {
      if (typeof fileOrPath === 'string') {
        // Это path из сообщения
        await loadDocumentFromUrl(fileOrPath);
      } else {
        // Это файл, загруженный пользователем
        setFileName(fileOrPath.name);
        const arrayBuffer = await fileOrPath.arrayBuffer();
        instanceRef.current.UI.loadDocument(arrayBuffer, { filename: fileOrPath.name });
      }
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
    }
  };
  return (
    <>
      <div style={{ 
        height: '100vh', 
        width: '100vw', 
        position: 'relative', 
        overflow: 'hidden', 
      }}>
        <div ref={viewer} style={{ width: '100%', height: '100%' }} />
      </div>
      
      <ChatHistory 
        chats={chats} 
        setChats={setChats} 
        currentChatId={currentChatId} 
        setCurrentChatId={setCurrentChatId}
        setFileName={setFileName}
        instanceRef={instanceRef}
      />
      
      <ChatBot 
        onFileUpload={handleFileFromChat} 
        currentChatId={currentChatId}
      />
    </>
  );
}

export default App;