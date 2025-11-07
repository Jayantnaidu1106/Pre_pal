import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.services.js';

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Track active users
const activeUsers = new Map();

// Track whiteboard state per project
const whiteboardState = new Map();

io.use(async (socket,next)=>{
    try{
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
        const projectId = socket.handshake.headers?.projectid || socket.handshake.query?.projectId || socket.handshake.auth?.projectId;

        // Checkpoint: Validate token
        if(!token){
            return next(new Error('Unauthorized - No token provided'));
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return next(new Error('Unauthorized - Invalid token'));
        }
        socket.user = decoded;

        if(projectId){
            if(!mongoose.Types.ObjectId.isValid(projectId)){
                return next(new Error('Invalid project ID format'));
            }

            socket.project = await projectModel.findById(projectId);
            if(!socket.project){
                return next(new Error('Project not found'));
            }
        } else {

            socket.project = { _id: 'no-project', name: 'No Project' };
        }

        next();

    }catch(error){
        next(error);
    }
});

io.on('connection', socket => {

    console.log('A User Connected');

    socket.roomId = socket.project._id.toString();

    const connectedAt = new Date().toISOString();


    activeUsers.set(socket.user.userId, {
        socketId: socket.id,
        userInfo: {
            userId: socket.user.userId,
            email: socket.user.email
        },
        projectId: socket.project._id,
        connectedAt: connectedAt
    });


    socket.join(socket.roomId);


    socket.on('project-message', async (data)=>{

        const message = data.message;

        const aiIsPresentInMessage = message.includes('@ai');

        if(aiIsPresentInMessage){
            try {
                const prompt = message.replace('@ai','').trim();
                console.log('AI Request received. Prompt:', prompt);
                
                const result = await generateResult(prompt);
                console.log('AI Response generated successfully');
                
                io.to(socket.roomId).emit('project-message', {
                    message: result,
                    sender: 'ai',
                    projectId: socket.project._id,
                    timestamp: new Date(),
                    user: { name: 'AI', email: 'ai@example.com' }
                });
            } catch (error) {
                console.error('AI Generation Error:', error.message);
                io.to(socket.roomId).emit('project-message', {
                    message: `Sorry, I encountered an error: ${error.message}. Please try again.`,
                    sender: 'ai',
                    projectId: socket.project._id,
                    timestamp: new Date(),
                    user: { name: 'AI', email: 'ai@example.com' }
                });
            }
        }

        if (!data || !data.message) return;
        socket.broadcast.to(socket.roomId).emit('project-message', data);
    });
    socket.on('disconnect', () => {
        console.log('A User Disconnected');
        activeUsers.delete(socket.user.userId);
    });


    socket.on('check-user-status', (userId) => {
        const isConnected = activeUsers.has(userId);
        socket.emit('user-status', { userId, isConnected });
    });


    socket.on('get-active-users', () => {
        const users = Array.from(activeUsers.values()).map(user => ({
            userId: user.userInfo.userId,
            email: user.userInfo.email,
            projectId: user.projectId,
            connectedAt: user.connectedAt
        }));
        socket.emit('active-users', users);
    });

    // Whiteboard Events
    socket.on('whiteboard:request-init', (data) => {
        const projectId = data.projectId || socket.roomId;
        const history = whiteboardState.get(projectId) || [];
        console.log(`Sending whiteboard init to user. Project: ${projectId}, History items: ${history.length}`);
        socket.emit('whiteboard:init', { history });
    });

    socket.on('whiteboard:draw', (data) => {
        if (!data || !data.points) return;
        
        console.log(`Whiteboard draw from user ${data.userId}, points: ${data.points.length}`);
        
        // Store in whiteboard history
        const projectId = data.projectId || socket.roomId;
        const history = whiteboardState.get(projectId) || [];
        history.push(data);
        
        // Limit history to last 1000 actions to prevent memory issues
        if (history.length > 1000) {
            history.shift();
        }
        
        whiteboardState.set(projectId, history);
        
        // Broadcast to other users in the room
        console.log(`Broadcasting draw to room ${socket.roomId}`);
        socket.broadcast.to(socket.roomId).emit('whiteboard:draw', data);
    });

    socket.on('whiteboard:clear', (data) => {
        const projectId = data.projectId || socket.roomId;
        console.log(`Clearing whiteboard for project ${projectId}`);
        whiteboardState.set(projectId, []);
        socket.broadcast.to(socket.roomId).emit('whiteboard:clear', data);
    });

    socket.on('whiteboard:undo', (data) => {
        const projectId = data.projectId || socket.roomId;
        const history = whiteboardState.get(projectId) || [];
        
        if (history.length > 0) {
            history.pop();
            whiteboardState.set(projectId, history);
            console.log(`Undo whiteboard action. Remaining: ${history.length}`);
        }
        
        socket.broadcast.to(socket.roomId).emit('whiteboard:undo', data);
    });

    socket.on('whiteboard:cursor', (data) => {
        // Broadcast cursor position to other users (don't store in history)
        socket.broadcast.to(socket.roomId).emit('whiteboard:cursor', data);
    });
});

// Utility function to check if user is connected (can be used in routes)
export const isUserConnected = (userId) => {
    return activeUsers.has(userId);
};

// Utility function to get all active users (can be used in routes)
export const getActiveUsers = () => {
    return Array.from(activeUsers.values()).map(user => ({
        userId: user.userInfo.userId,
        email: user.userInfo.email,
        projectId: user.projectId,
        connectedAt: user.connectedAt
    }));
};

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});