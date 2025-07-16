console.info("hello world");
//console.info(process.env.AUTH0_CLIENT_SECRET);
console.info(process.env.PORT);




// minimum app for testing
const express = require('express');
const app = express();
//const port = 8080;
const port = process.env.PORT || 3000

// Define a route for the root URL ("/")
app.get('/', (req, res) => {
    res.send('Hello World!</br>' + process.env.DB_PROT);
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});