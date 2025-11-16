import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Groups.css';

const API_URL = 'http://localhost:3002';

interface Group {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  members: any[];
}

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/groups`, {
        name: groupName,
        description: groupDescription,
      });
      setGroupName('');
      setGroupDescription('');
      setShowCreateForm(false);
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className="groups-page">
      <div className="groups-header">
        <h1>Группы</h1>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="create-group-btn">
          Создать группу
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={createGroup} className="create-group-form">
          <input
            type="text"
            placeholder="Название группы"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          <textarea
            placeholder="Описание (необязательно)"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
          />
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Создать
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="cancel-btn"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="groups-list">
        {groups.length === 0 ? (
          <p className="empty-state">У вас пока нет групп</p>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="group-item"
              onClick={() => navigate(`/group/${group.id}`)}
            >
              <div className="group-avatar">{group.name[0].toUpperCase()}</div>
              <div className="group-info">
                <div className="group-name">{group.name}</div>
                <div className="group-members">
                  {group.members?.length || 0} участников
                </div>
                {group.description && (
                  <div className="group-description">{group.description}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Groups;

