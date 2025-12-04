import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
    socket: Socket | null = null;

    connect() {
        if (this.socket) return this.socket;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            // Emit user join with authentication info
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');

                const user = JSON.parse(userStr || '{}');
                const userId = user.id || user._id;

                if (userId) {
                    this.socket?.emit('user-join', {
                        userId: userId,
                        role: user.role,
                        name: user.name
                    });
                }
            }
        });

        this.socket.on('disconnect', () => {
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        if (!this.socket) {
            return this.connect();
        }
        return this.socket;
    }
}

export const socketService = new SocketService();
