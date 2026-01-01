import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Mail, Phone, Calendar } from '../components/icons/index.jsx';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (user) => {
    if (newRole === user.role) {
      setEditingUser(null);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/admin/users/${user.user_id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRole
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`User role updated to ${newRole}`);
        fetchUsers(); // Refresh user list
        setEditingUser(null);
        setNewRole('');
      } else {
        alert(data.message || 'Failed to update role');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="px-2 py-1 bg-purple-900/20 text-purple-400 rounded text-xs font-semibold">
          Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-blue-900/20 text-blue-400 rounded text-xs font-semibold">
        User
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-primary">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">User Management</h1>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-secondary">{users.length} users</span>
        </div>
      </div>

      <div className="bg-secondary rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-primary font-medium">User</th>
              <th className="text-left p-4 text-primary font-medium">Contact</th>
              <th className="text-left p-4 text-primary font-medium">Role</th>
              <th className="text-left p-4 text-primary font-medium">Joined</th>
              <th className="text-left p-4 text-primary font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id} className="border-b border-border hover:bg-primary/5">
                <td className="p-4">
                  <div>
                    <p className="text-primary font-semibold">{user.name}</p>
                    <p className="text-secondary text-sm mt-1">{user.email}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    {user.phone && (
                      <div className="flex items-center gap-2 text-secondary text-sm">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </div>
                    )}
                    {user.address && (
                      <p className="text-secondary text-sm truncate max-w-xs" title={user.address}>
                        {user.address}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  {editingUser === user.user_id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="px-2 py-1 bg-primary bg-opacity-20 border border-border rounded text-primary text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  ) : (
                    getRoleBadge(user.role)
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-secondary text-sm">
                    <Calendar className="h-3 w-3" />
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
                  {editingUser === user.user_id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRoleChange(user)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingUser(null);
                          setNewRole('');
                        }}
                        className="px-3 py-1 bg-secondary text-primary rounded text-sm hover:bg-primary/20"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingUser(user.user_id);
                        setNewRole(user.role);
                      }}
                      className="px-3 py-1 bg-accent text-white rounded text-sm hover:bg-white hover:text-black transition"
                    >
                      Change Role
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagementPage;