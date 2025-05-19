const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the "views" directory
app.use(express.static('views'));

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// About route
app.get('/about', (req, res) => {
    res.send('<h2>About Page</h2><p>This is a sample Node.js app.</p>');
});

// 404 route
app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
