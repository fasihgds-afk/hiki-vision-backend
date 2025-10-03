# Server Console Documentation

## Overview

The Server Console is a web-based administrative interface for monitoring and managing the Node.js backend server. It provides real-time information about system resources, database connections, server logs, and server control functions.

## Features

- **System Information**: View server hostname, platform, CPU cores, memory usage, uptime, and Node.js version
- **Database Monitoring**: Check MongoDB connection status, database name, and collection information
- **Server Logs**: Access and filter server logs directly from the browser
- **Server Control**: Restart the server when needed

## Security

The console is protected by Basic Authentication. Default credentials are:

- Username: `admin`
- Password: `admin123`

For production environments, you should set custom credentials using environment variables:

```
CONSOLE_USERNAME=your_username
CONSOLE_PASSWORD=your_secure_password
```

## Accessing the Console

1. Start the server: `npm start` or `node server.js`
2. Open a browser and navigate to: `http://localhost:3001/console`
3. Enter your username and password when prompted

## API Endpoints

The console frontend communicates with these API endpoints:

- `GET /api/console/system-info`: System information
- `GET /api/console/logs`: Server logs (query param: `lines`)
- `GET /api/console/connections`: Database connection information
- `POST /api/console/restart`: Restart the server

All endpoints require Basic Authentication.

## Testing

A test script is included to verify the console functionality:

```bash
node test-console.js
```

This will test all API endpoints and verify authentication.

## Implementation Details

- The console UI is built with vanilla HTML, CSS, and JavaScript
- Server logs are stored in `server.log` in the root directory
- The console uses the custom logger from `consoleController.js`

## Customization

To customize the console:

1. Modify `public/console.html` for UI changes
2. Edit `controllers/consoleController.js` for backend functionality
3. Update `routes/consoleRoutes.js` to add or modify endpoints

## Troubleshooting

- If authentication fails, check your environment variables
- If logs aren't showing, verify the `server.log` file exists and is writable
- For connection issues, ensure the server is running on the expected port