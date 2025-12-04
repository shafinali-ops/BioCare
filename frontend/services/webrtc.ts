import Peer from 'simple-peer';
import { socketService } from './socket';

class WebRTCService {
    peer: Peer.Instance | null = null;
    socket = socketService.getSocket();

    initiateCall(stream: MediaStream, userToCall: string, callerId: string, callerName: string, callType: string, roomId: string) {
        this.peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        });

        this.peer.on('signal', (data) => {
            this.socket.emit('call-user', {
                userToCall,
                signalData: data,
                callerId,
                callerName,
                callType,
                roomId,
                offer: data
            });
        });

        return this.peer;
    }

    acceptCall(stream: MediaStream, callerSignal: any, callerId: string) {
        this.peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        });

        this.peer.on('signal', (data) => {
            this.socket.emit('make-answer', {
                signalData: data,
                to: callerId,
                answer: data
            });
        });

        this.peer.signal(callerSignal);

        return this.peer;
    }

    destroy() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }
}

export const webRTCService = new WebRTCService();
