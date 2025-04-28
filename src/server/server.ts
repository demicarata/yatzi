import { Server } from 'socket.io';
import cors from 'cors';
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app); // create a raw HTTP server first

app.use(cors({
    origin: "http://localhost:3000", // React app's URL
    methods: ["GET", "POST"],
}));

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // React app's URL
        methods: ["GET", "POST"],
    }
});


type GameRoom = {
    player1: string | null;
    player2: string | null;
    currentTurn: number;
};

let gameRooms: { [code: string]: GameRoom } = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Auto create game on load
    socket.on('createGame', () => {
        const gameCode = Math.random().toString(36).substring(2, 7).toUpperCase();

        gameRooms[gameCode] = {
            player1: socket.id,
            player2: null,
            currentTurn: 1
        };

        socket.join(gameCode); // Join the Socket.io room
        socket.data.gameCode = gameCode;
        socket.data.playerNumber = 1;

        socket.emit('gameCreated', { gameCode, playerNumber: 1 });
    });

    socket.on('joinGame', (code: string) => {
        const gameCode = code.toUpperCase();
        const room = gameRooms[gameCode];

        if (!room) {
            socket.emit('gameJoinError', 'Game code not found.');
            return;
        }

        if (room.player2) {
            socket.emit('gameJoinError', 'Game is already full.');
            return;
        }

        room.player2 = socket.id;
        socket.join(gameCode);
        socket.data.gameCode = gameCode;
        socket.data.playerNumber = 2;

        // Notify both players
        io.to(room.player1!).emit('playerJoined', { playerNumber: 2 });
        socket.emit('gameJoined', { gameCode, playerNumber: 2 });

        // Send turn update to both
        io.to(gameCode).emit('turnUpdate', room.currentTurn);
    });

    socket.on('rollDice', (diceValues: number[]) => {
        const { gameCode, playerNumber } = socket.data;
        const room = gameRooms[gameCode];
        if (!room || room.currentTurn !== playerNumber) return;

        socket.to(gameCode).emit('opponentRolled', diceValues);
    });

    socket.on('updateScore', ({ index, score }) => {
        const { gameCode, playerNumber } = socket.data;
        const room = gameRooms[gameCode];
        if (!room || room.currentTurn !== playerNumber) return;

        socket.to(gameCode).emit('opponentScoreUpdate', { index, score });

        // Switch turn
        room.currentTurn = room.currentTurn === 1 ? 2 : 1;
        io.to(gameCode).emit('turnUpdate', room.currentTurn);
    });

    socket.on('disconnect', () => {
        const { gameCode, playerNumber } = socket.data;

        if (!gameCode || !gameRooms[gameCode]) return;

        const room = gameRooms[gameCode];
        if (playerNumber === 1) {
            room.player1 = null;
        } else if (playerNumber === 2) {
            room.player2 = null;
        }

        console.log(`Player ${playerNumber} disconnected from ${gameCode}`);

        // Notify remaining player
        io.to(gameCode).emit('turnUpdate', null); // Turn pause
    });
});

server.listen(4000, () => {
    console.log('Socket.IO server running on http://localhost:4000');
});
