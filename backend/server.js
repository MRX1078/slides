const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

// Явно указываем Content-Type для PPTX-файлов, даже если нет расширения
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);

  // Проверяем, что файл существует
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  // Устанавливаем правильный Content-Type
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  // Можно добавить оригинальное имя файла для корректного скачивания
  res.setHeader('Content-Disposition', `inline; filename="${req.query.name || req.params.filename}.pptx"`);

  res.sendFile(filePath);
});

// Загрузка файла
app.post('/upload', upload.single('file'), (req, res) => {
  // Возвращаем ссылку на файл и оригинальное имя
  // Для ONLYOFFICE желательно добавить имя как query-параметр
  const fileUrl = `http://10.55.53.136:3001/uploads/${req.file.filename}?name=${encodeURIComponent(req.file.originalname)}`;
  res.json({ url: fileUrl, name: req.file.originalname });
});

app.listen(3001, () => console.log('Backend started on http://10.55.53.136:3001'));
