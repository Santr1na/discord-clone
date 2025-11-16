import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import WebRTC from '../components/WebRTC';
import './Chat.css';

const API_URL = 'http://localhost:3002';
const SOCKET_URL = 'http://localhost:3002';

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId?: number;
  groupId?: number;
  createdAt: string;
  sender: {
    id: number;
    username: string;
  };
}

const Chat: React.FC = () => {
  const { friendId, groupId } = useParams<{ friendId?: string; groupId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [chatTitle, setChatTitle] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io(`${SOCKET_URL}/messages`);
    setSocket(newSocket);

    newSocket.on('message', (message: Message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    loadMessages();
    loadChatInfo();
  }, [friendId, groupId]);

  const loadChatInfo = async () => {
    if (friendId) {
      try {
        const friends = await axios.get(`${API_URL}/friends`);
        const friend = friends.data.find((f: any) => f.id === parseInt(friendId));
        if (friend) {
          setChatTitle(friend.username);
        } else {
          setChatTitle(`Пользователь ${friendId}`);
        }
      } catch (error) {
        setChatTitle(`Пользователь ${friendId}`);
      }
    } else if (groupId) {
      try {
        const group = await axios.get(`${API_URL}/groups/${groupId}`);
        setChatTitle(group.data.name);
      } catch (error) {
        setChatTitle(`Группа ${groupId}`);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      let response;
      if (friendId) {
        response = await axios.get(`${API_URL}/messages/direct/${friendId}`);
      } else if (groupId) {
        response = await axios.get(`${API_URL}/messages/group/${groupId}`);
      }
      if (response) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData: any = {
        content: newMessage,
        type: 'text',
      };

      if (friendId) {
        messageData.receiverId = parseInt(friendId);
      } else if (groupId) {
        messageData.groupId = parseInt(groupId);
      }

      const response = await axios.post(`${API_URL}/messages`, messageData);
      setNewMessage('');

      if (socket) {
        socket.emit('message', messageData);
      }
      
      // Reload messages to get the saved message with ID
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Назад
        </button>
        <h2>
          {chatTitle || (friendId ? `Чат с пользователем ${friendId}` : `Группа ${groupId}`)}
        </h2>
        {friendId && (
          <button onClick={() => setIsCalling(!isCalling)} className="call-btn">
            {isCalling ? 'Завершить звонок' : 'Позвонить'}
          </button>
        )}
      </div>

      {isCalling && friendId && (
        <div className="webrtc-container">
          <WebRTC friendId={friendId} />
        </div>
      )}

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${
              message.senderId === user?.id ? 'message-sent' : 'message-received'
            }`}
          >
            <div className="message-header">
              <span className="message-sender">{message.sender.username}</span>
              <span className="message-time">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Напишите сообщение..."
          className="message-input"
        />
        <button type="submit" className="send-btn">
          Отправить
        </button>
      </form>
    </div>
  );
};

export default Chat;

