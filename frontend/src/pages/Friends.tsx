import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Friends.css';

const API_URL = 'http://localhost:3001';

interface Friend {
  id: number;
  username: string;
  avatar?: string;
  status: string;
}

const Friends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);

  const loadFriends = async () => {
    try {
      const response = await axios.get(`${API_URL}/friends`);
      setFriends(response.data);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/friends/pending`);
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/users/search`, {
        params: { query },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendFriendRequest = async (friendId: number) => {
    try {
      await axios.post(`${API_URL}/friends/request`, { friendId });
      alert('Запрос в друзья отправлен');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка отправки запроса');
    }
  };

  const acceptFriendRequest = async (friendId: number) => {
    try {
      await axios.post(`${API_URL}/friends/accept/${friendId}`);
      loadFriends();
      loadPendingRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const rejectFriendRequest = async (friendId: number) => {
    try {
      await axios.post(`${API_URL}/friends/reject/${friendId}`);
      loadPendingRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1>Друзья</h1>
        <button onClick={() => setShowSearch(!showSearch)} className="add-friend-btn">
          Добавить друга
        </button>
      </div>

      {showSearch && (
        <div className="search-section">
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchUsers(e.target.value);
            }}
            className="search-input"
          />
          <div className="search-results">
            {searchResults.map((user) => (
              <div key={user.id} className="search-result-item">
                <div className="user-avatar">{user.username[0].toUpperCase()}</div>
                <div className="user-info">
                  <div className="username">{user.username}</div>
                  <div className="user-status">{user.status}</div>
                </div>
                <button onClick={() => sendFriendRequest(user.id)} className="add-btn">
                  Добавить
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="pending-section">
          <h2>Входящие запросы ({pendingRequests.length})</h2>
          {pendingRequests.map((request) => (
            <div key={request.id} className="friend-item">
              <div className="user-avatar">{request.username[0].toUpperCase()}</div>
              <div className="user-info">
                <div className="username">{request.username}</div>
                <div className="user-status">{request.status}</div>
              </div>
              <div className="friend-actions">
                <button
                  onClick={() => acceptFriendRequest(request.id)}
                  className="accept-btn"
                >
                  Принять
                </button>
                <button
                  onClick={() => rejectFriendRequest(request.id)}
                  className="reject-btn"
                >
                  Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="friends-section">
        <h2>Друзья ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="empty-state">У вас пока нет друзей</p>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.id}
              className="friend-item"
              onClick={() => navigate(`/chat/${friend.id}`)}
            >
              <div className="user-avatar">{friend.username[0].toUpperCase()}</div>
              <div className="user-info">
                <div className="username">{friend.username}</div>
                <div className="user-status">{friend.status}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Friends;

