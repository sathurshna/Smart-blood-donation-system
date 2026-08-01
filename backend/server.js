const express = require('express'); //loads the Express library so we can use it
const app = express();

app.use(express.json());
//tells Express to automatically parse incoming JSON request bodies (you'll need this for login, registration, etc.)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
//defines a route; when someone visits /health, respond with a simple status message. This is a standard pattern used to check "is my server alive?"

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//starts the server listening for requests