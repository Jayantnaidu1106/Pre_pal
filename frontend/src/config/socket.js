import socket from 'socket.io-client';

let socketInstance = null;

export const intializeSocket = (projectid) => {
    // Checkpoint: Return existing socket if available
    if (socketInstance) {
        return socketInstance;
    }

    // Checkpoint: Create new socket connection
    socketInstance = socket('http://localhost:3000', {
        auth: {
            token: localStorage.getItem('token'),
            projectId: projectid
        },
        query: {
            projectId: projectid
        },
        extraHeaders: {
            projectid: projectid
        }
    });

    // Checkpoint: Handle connection events
    socketInstance.on('connect', () => {
        // Connection established successfully
    });

    socketInstance.on('disconnect', () => {
        // Connection lost
    });

    socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    // Checkpoint: Set up event listeners
    socketInstance.on('user-status', () => {
        // User status received
    });

    socketInstance.on('active-users', () => {
        // Active users list received
    });

    return socketInstance;
};

export const recieveMessage = (eventname, callback) => {
    // Checkpoint: Validate socket instance
    if (!socketInstance) {
        return;
    }
    socketInstance.on(eventname, callback);
};

export const sendMessage = (eventname, data) => {
    // Checkpoint: Validate socket instance
    if (!socketInstance) {
        return;
    }
    socketInstance.emit(eventname, data);
};

// Check if a specific user is connected
export const checkUserStatus = (userId) => {
    // Checkpoint: Validate socket instance
    if (!socketInstance) {
        return;
    }
    socketInstance.emit('check-user-status', userId);
};

// Get list of all active users
export const getActiveUsers = () => {
    // Checkpoint: Validate socket instance
    if (!socketInstance) {
        return;
    }
    socketInstance.emit('get-active-users');
};

// Check if current socket is connected
export const isConnected = () => {
    return socketInstance && socketInstance.connected;
};

// Get current socket ID
export const getSocketId = () => {
    return socketInstance ? socketInstance.id : null;
};

// Disconnect socket
export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};