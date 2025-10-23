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

        // Checkpoint: Validate project if provided
        if(projectId){
            if(!mongoose.Types.ObjectId.isValid(projectId)){
                return next(new Error('Invalid project ID format'));
            }

            socket.project = await projectModel.findById(projectId);
            if(!socket.project){
                return next(new Error('Project not found'));
            }
        } else {
            // Allow connection without project for testing
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
            const prompt = message.replace('@ai','');
            const result  = await generateResult(prompt);
           io.to(socket.roomId).emit('project-message', {
                message: result,
                sender: 'ai',
                projectId: socket.project._id,
                timestamp: new Date(),
                user: { name: 'AI', email: 'ai@example.com' }
            });
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