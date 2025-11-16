import React, { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import './WebRTC.css';

const SOCKET_URL = 'http://localhost:3002';

interface WebRTCProps {
  friendId: string;
}

const WebRTC: React.FC<WebRTCProps> = ({ friendId }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    const roomId = `call-${friendId}`;
    newSocket.emit('join-room', roomId);
    
    newSocket.on('user-joined', (userId: string) => {
      console.log('User joined:', userId);
    });
    
    newSocket.on('user-left', (userId: string) => {
      console.log('User left:', userId);
    });

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        newSocket.emit('ice-candidate', {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    newSocket.on('offer', async (data: { offer: any; from: string }) => {
      if (data.from !== newSocket.id) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        newSocket.emit('answer', { roomId, answer });
      }
    });

    newSocket.on('answer', async (data: { answer: any; from: string }) => {
      if (data.from !== newSocket.id) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    newSocket.on('ice-candidate', async (data: { candidate: any; from: string }) => {
      if (data.from !== newSocket.id && data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    startLocalStream();

    return () => {
      newSocket.close();
      stopLocalStream();
      pc.close();
    };
  }, [friendId]);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      // Create and send offer
      if (peerConnectionRef.current && socket) {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        const roomId = `call-${friendId}`;
        socket.emit('offer', { roomId, offer });
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  };

  const toggleScreenShare = async () => {
    if (!peerConnectionRef.current) return;

    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current
          .getSenders()
          .find((s) => s.track && s.track.kind === 'video');

        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        videoTrack.onended = () => {
          setIsScreenSharing(false);
          startLocalStream();
        };

        setIsScreenSharing(true);
      } else {
        await startLocalStream();
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  return (
    <div className="webrtc-container">
      <div className="video-container">
        <div className="video-wrapper">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
          <div className="video-label">Удаленный пользователь</div>
        </div>
        <div className="video-wrapper local">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
          <div className="video-label">Вы</div>
        </div>
      </div>
      <div className="webrtc-controls">
        <button onClick={toggleScreenShare} className="control-btn">
          {isScreenSharing ? 'Остановить демонстрацию' : 'Демонстрировать экран'}
        </button>
      </div>
    </div>
  );
};

export default WebRTC;

