import axios from 'axios';

const api = axios.create({
  baseURL: 'https://46.253.132.35.sslip.io/', // Укажите ваш базовый URL
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

/**
 * Получить список чатов
 * @param {number} [offset=0] - Смещение для пагинации
 * @param {number} [limit=100] - Лимит на количество чатов
 * @returns {Promise<Array>} - Массив объектов чатов
 */
export const getChatList = async (offset = 0, limit = 100) => {
  try {
    const response = await api.get('/api/v1/chat/', {
      params: { offset, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка чатов:', error);
    throw error;
  }
};

/**
 * Создать новый чат с презентацией
 * @param {string} title - Название чата
 * @param {File} presentation - Файл презентации (PPT/PPTX)
 * @returns {Promise<Object>} - Созданный чат
 */
export const createChat = async (title, presentation) => {
  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('presentation', presentation);

    const response = await api.post('/api/v1/chat/', formData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании чата:', error);
    throw error;
  }
};

/**
 * Получить чат по ID со всеми сообщениями
 * @param {string} id - UUID чата
 * @returns {Promise<Object>} - Объект чата с сообщениями
 */
export const getChatById = async (id) => {
  try {
    const response = await api.get(`/api/v1/chat/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении чата ${id}:`, error);
    throw error;
  }
};

/**
 * Добавить сообщение в чат
 * @param {string} chatId - UUID чата
 * @param {string|null} historyId - UUID истории (может быть null)
 * @param {string} message - Текст сообщения
 * @returns {Promise<Object>} - Ответ сервера
 */
export const addMessageToChat = async (chatId, historyId, message) => {
  try {
    const response = await api.post(
      `/api/v1/chat/${chatId}/add_message`,
      null,
      {
        params: {
          chat_id: chatId,
          history_id: historyId,
          message
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    throw error;
  }
};

export default {
  getChatList,
  createChat,
  getChatById,
  addMessageToChat
};
