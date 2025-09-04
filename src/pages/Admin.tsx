import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameDatabase, User, Team, Player, SAMPLE_PLAYERS } from '@/lib/database';
import { useNavigate } from 'react-router-dom';

type PlayerPosition = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ id: '', password: '', managerName: '' });
  const [error, setError] = useState('');

  const db = GameDatabase.getInstance();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(db.getUsers());
    setTeams(db.getTeams());
    setPlayers(db.getPlayers());
  };

  const handleAdminLogin = () => {
    if (loginForm.id === 'admin' && loginForm.password === 'roman@123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin credentials');
    }
  };

  const handleRemoveManager = (userId: string) => {
    if (confirm('Are you sure you want to remove this manager?')) {
      // Remove user
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem('ipl_users', JSON.stringify(updatedUsers));
      
      // Free up their team
      const updatedTeams = teams.map(team => 
        team.manager === userId ? { ...team, manager: undefined, squad: [], budget: 10000 } : team
      );
      localStorage.setItem('ipl_teams', JSON.stringify(updatedTeams));
      
      // Free up their players
      const updatedPlayers = players.map(player => 
        player.team && teams.find(t => t.manager === userId && t.id === player.team)
          ? { ...player, team: undefined, currentPrice: undefined }
          : player
      );
      localStorage.setItem('ipl_players', JSON.stringify(updatedPlayers));
      
      loadData();
      alert('Manager removed successfully');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      id: user.id,
      password: user.password,
      managerName: user.managerName
    });
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    
    // Update the user in the users array
    const updatedUsers = users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, id: editForm.id, password: editForm.password, managerName: editForm.managerName }
        : user
    );
    
    // Update localStorage
    localStorage.setItem('ipl_users', JSON.stringify(updatedUsers));
    
    // Update team manager reference if user ID changed
    if (selectedUser.id !== editForm.id) {
      const updatedTeams = teams.map(team => 
        team.manager === selectedUser.id 
          ? { ...team, manager: editForm.id }
          : team
      );
      localStorage.setItem('ipl_teams', JSON.stringify(updatedTeams));
    }
    
    setSelectedUser(null);
    setEditForm({ id: '', password: '', managerName: '' });
    loadData();
    alert('User updated successfully');
  };

  const handleChangeTeamName = (teamId: string) => {
    const newName = prompt('Enter new team name:');
    if (newName) {
      const updatedTeams = teams.map(team => 
        team.id === teamId ? { ...team, name: newName } : team
      );
      localStorage.setItem('ipl_teams', JSON.stringify(updatedTeams));
      loadData();
      alert('Team name updated successfully');
    }
  };

  const downloadExcelTemplate = () => {
    try {
      // Create CSV content with all players data including new batting skills
      const headers = [
        'ID', 'Name', 'Country', 'Age', 'Base Price', 'Position', 
        'Batting Skill vs Spin', 'Batting Skill vs Seam', 'Bowling Skill', 'Fielding Skill', 'Wicket Keeping Skill',
        'Fitness', 'Experience', 'Form', 'Trait', 'Batting Sub Category', 
        'Bowling Sub Category', 'Capped', 'Skill Points'
      ];
      
      let csvContent = headers.join(',') + '\n';
      
      players.forEach(player => {
        const row = [
          player.id,
          `"${player.name}"`,
          player.country,
          player.age,
          player.basePrice,
          player.position,
          player.battingSkillVsSpin,
          player.battingSkillVsSeam,
          player.bowlingSkill,
          player.fieldingSkill,
          player.wicketKeepingSkill,
          player.fitness,
          player.experience,
          player.form,
          `"${player.trait}"`,
          `"${player.battingSubCategory}"`,
          `"${player.bowlingSubCategory}"`,
          player.capped,
          player.skillPoints
        ];
        csvContent += row.join(',') + '\n';
      });

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'ipl_players_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('Player template downloaded successfully! You can edit this CSV file and upload it back.');
      } else {
        alert('Download not supported in this browser');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading template. Please try again.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        // Parse CSV content
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          alert('File appears to be empty or invalid format');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const newPlayers: Player[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length >= 6) { // Minimum required fields
            const player: Player = {
              id: values[0] || `player_${Date.now()}_${i}`,
              name: values[1] || 'Unknown Player',
              country: values[2] || 'Unknown',
              age: parseInt(values[3]) || 25,
              basePrice: parseInt(values[4]) || 50,
              position: (values[5] as PlayerPosition) || 'Batsman',
              battingSkillVsSpin: parseInt(values[6]) || 10,
              battingSkillVsSeam: parseInt(values[7]) || 10,
              bowlingSkill: parseInt(values[8]) || 10,
              fieldingSkill: parseInt(values[9]) || 10,
              wicketKeepingSkill: parseInt(values[10]) || 1,
              fitness: parseInt(values[11]) || 15,
              experience: parseInt(values[12]) || 10,
              form: parseInt(values[13]) || 15,
              trait: values[14] || 'Middle Order (4-6)',
              battingSubCategory: values[15] || 'Right-hand Batsman',
              bowlingSubCategory: values[16] || 'Right-arm medium',
              capped: values[17]?.toLowerCase() === 'true',
              skillPoints: parseInt(values[18]) || 0
            };
            
            // Calculate skill points if not provided or invalid
            if (!player.skillPoints || player.skillPoints === 0) {
              player.skillPoints = player.battingSkillVsSpin + player.battingSkillVsSeam + 
                                 player.bowlingSkill + player.fieldingSkill + player.wicketKeepingSkill + 
                                 player.fitness + player.experience + player.form;
            }
            
            newPlayers.push(player);
          }
        }

        if (newPlayers.length === 0) {
          alert('No valid player data found in the file');
          return;
        }

        // Update existing players or add new ones
        const existingPlayers = db.getPlayers();
        const updatedPlayers = [...existingPlayers];

        newPlayers.forEach(newPlayer => {
          const existingIndex = updatedPlayers.findIndex(p => p.id === newPlayer.id);
          if (existingIndex >= 0) {
            // Update existing player (preserve team assignment)
            const existingPlayer = updatedPlayers[existingIndex];
            updatedPlayers[existingIndex] = { 
              ...newPlayer, 
              team: existingPlayer.team,
              currentPrice: existingPlayer.currentPrice
            };
          } else {
            // Add new player
            updatedPlayers.push(newPlayer);
          }
        });

        localStorage.setItem('ipl_players', JSON.stringify(updatedPlayers));
        loadData();
        alert(`Successfully processed ${newPlayers.length} players from the uploaded file!`);
        
      } catch (error) {
        console.error('File processing error:', error);
        alert('Error processing file. Please check the format and try again.');
      }
    };

    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };

    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  const resetDatabase = () => {
    if (confirm('Are you sure you want to reset the entire database? This cannot be undone.')) {
      localStorage.clear();
      db.initializeDatabase();
      loadData();
      alert('Database reset successfully');
    }
  };

  const addSamplePlayers = () => {
    const currentPlayers = db.getPlayers();
    const newPlayers = [...currentPlayers, ...SAMPLE_PLAYERS];
    localStorage.setItem('ipl_players', JSON.stringify(newPlayers));
    loadData();
    alert('Sample players added successfully');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-6">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminId" className="text-white">Admin ID</Label>
              <Input
                id="adminId"
                value={loginForm.id}
                onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                placeholder="Enter admin ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="text-white">Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                placeholder="Enter password"
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full bg-red-600 hover:bg-red-700">
              Login as Admin
            </Button>
            {error && <p className="text-red-400 text-center text-sm">{error}</p>}
            <div className="text-center">
              <Button onClick={() => navigate('/')} variant="ghost" className="text-white">
                Back to Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
            <p className="text-red-200">IPL 2025 Cricket Management Game</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Game
            </Button>
            <Button onClick={() => setIsAuthenticated(false)} variant="ghost" className="text-white">
              Logout
            </Button>
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="users" className="data-[state=active]:bg-white/20">Users & Teams</TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-white/20">Player Management</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-white/20">System Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Registered Users */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Registered Users ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => {
                    const userTeam = teams.find(t => t.manager === user.id);
                    return (
                      <div key={user.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-white font-semibold">{user.managerName}</h3>
                            <p className="text-red-200 text-sm">ID: {user.id}</p>
                            {userTeam && (
                              <Badge className="mt-1">{userTeam.name}</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleEditUser(user)}
                              size="sm" 
                              variant="outline"
                            >
                              Edit
                            </Button>
                            <Button 
                              onClick={() => handleRemoveManager(user.id)}
                              size="sm" 
                              variant="destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Teams Overview */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Teams Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <div key={team.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-semibold">{team.name}</h3>
                          <p className="text-red-200 text-sm">
                            {team.manager ? `Manager: ${team.manager}` : 'Available'}
                          </p>
                          <p className="text-red-200 text-sm">
                            Squad: {team.squad?.length || 0}/25 | Budget: ₹{team.budget}L
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleChangeTeamName(team.id)}
                          size="sm" 
                          variant="outline"
                        >
                          Rename
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Edit User Modal */}
            {selectedUser && (
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Edit User: {selectedUser.managerName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white">User ID</Label>
                      <Input
                        value={editForm.id}
                        onChange={(e) => setEditForm({ ...editForm, id: e.target.value })}
                        className="bg-white/20 border-white/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Password</Label>
                      <Input
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        className="bg-white/20 border-white/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Manager Name</Label>
                      <Input
                        value={editForm.managerName}
                        onChange={(e) => setEditForm({ ...editForm, managerName: e.target.value })}
                        className="bg-white/20 border-white/30 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateUser} className="bg-green-600 hover:bg-green-700">
                      Update User
                    </Button>
                    <Button onClick={() => setSelectedUser(null)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Player Database Management ({players.length} players)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={downloadExcelTemplate} className="bg-blue-600 hover:bg-blue-700">
                    📥 Download Template (CSV)
                  </Button>
                  
                  <div>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="file-upload"
                    />
                    <Button 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="bg-green-600 hover:bg-green-700 w-full"
                    >
                      📤 Upload Player List
                    </Button>
                  </div>
                  
                  <Button onClick={addSamplePlayers} className="bg-purple-600 hover:bg-purple-700">
                    ➕ Add Sample Players
                  </Button>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Database Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-red-200">Total Players</div>
                      <div className="text-white font-bold">{players.length}</div>
                    </div>
                    <div>
                      <div className="text-red-200">Available Players</div>
                      <div className="text-white font-bold">{players.filter(p => !p.team).length}</div>
                    </div>
                    <div>
                      <div className="text-red-200">Assigned Players</div>
                      <div className="text-white font-bold">{players.filter(p => p.team).length}</div>
                    </div>
                    <div>
                      <div className="text-red-200">Capped Players</div>
                      <div className="text-white font-bold">{players.filter(p => p.capped).length}</div>
                    </div>
                  </div>
                </div>

                <div className="text-white text-sm bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Instructions:</h4>
                  <ul className="space-y-1 text-red-200">
                    <li>• Download the template to get the current player database in CSV format</li>
                    <li>• Edit the CSV file with your preferred spreadsheet application</li>
                    <li>• Upload the modified file to update existing players or add new ones</li>
                    <li>• Supported formats: CSV, Excel (.xlsx, .xls)</li>
                    <li>• New format includes separate batting skills vs Spin and vs Seam</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">System Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold">Database Management</h3>
                    <Button onClick={resetDatabase} variant="destructive" className="w-full">
                      Reset Entire Database
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold">Season Management</h3>
                    <Button variant="outline" className="w-full" disabled>
                      Start New Season (Coming Soon)
                    </Button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">System Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-red-200">Total Users</div>
                      <div className="text-white font-bold">{users.length}</div>
                    </div>
                    <div>
                      <div className="text-red-200">Active Teams</div>
                      <div className="text-white font-bold">{teams.filter(t => t.manager).length}/10</div>
                    </div>
                    <div>
                      <div className="text-red-200">Total Players</div>
                      <div className="text-white font-bold">{players.length}</div>
                    </div>
                    <div>
                      <div className="text-red-200">Available Players</div>
                      <div className="text-white font-bold">{players.filter(p => !p.team).length}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}