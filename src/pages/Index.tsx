import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GameDatabase, User, Team } from '@/lib/database';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ id: '', password: '', managerName: '' });
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState('');
  
  const db = GameDatabase.getInstance();
  const navigate = useNavigate();

  useEffect(() => {
    db.initializeDatabase();
    loadAvailableTeams();
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const loadAvailableTeams = () => {
    const teams = db.getAvailableTeams();
    setAvailableTeams(teams);
  };

  const handleLogin = () => {
    const user = db.authenticateUser(loginForm.id, loginForm.password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setError('');
      
      if (user.isAdmin) {
        navigate('/admin');
      } else if (user.teamId) {
        navigate('/dashboard');
      }
    } else {
      setError('Invalid credentials');
    }
  };

  const handleRegister = () => {
    if (!registerForm.id || !registerForm.password || !registerForm.managerName) {
      setError('All fields are required');
      return;
    }

    const newUser: User = {
      id: registerForm.id,
      password: registerForm.password,
      managerName: registerForm.managerName,
      isAdmin: false
    };

    if (db.createUser(newUser)) {
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setError('');
      setRegisterForm({ id: '', password: '', managerName: '' });
    } else {
      setError('User ID already exists');
    }
  };

  const handleTeamSelection = () => {
    if (!selectedTeam || !currentUser) return;

    if (db.assignTeamToManager(selectedTeam, currentUser.id)) {
      const updatedUser = { ...currentUser, teamId: selectedTeam };
      db.updateUser(updatedUser);
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      navigate('/dashboard');
    } else {
      setError('Team selection failed');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setSelectedTeam('');
    loadAvailableTeams();
  };

  if (currentUser && !currentUser.teamId && !currentUser.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">IPL 2025 Cricket Management</h1>
            <p className="text-blue-200">Welcome {currentUser.managerName}! Select your team to start managing.</p>
            <Button variant="outline" onClick={handleLogout} className="mt-4">
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTeams.map((team) => (
              <Card 
                key={team.id} 
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedTeam === team.id ? 'ring-2 ring-yellow-400' : ''
                }`}
                onClick={() => setSelectedTeam(team.id)}
              >
                <CardHeader 
                  className="text-center"
                  style={{ backgroundColor: team.colors.primary, color: 'white' }}
                >
                  <CardTitle className="text-xl">{team.name}</CardTitle>
                  <Badge variant="secondary">{team.shortName}</Badge>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-lg font-semibold">Budget: ₹{team.budget}L</p>
                    <p className="text-sm text-muted-foreground">Available for selection</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedTeam && (
            <div className="text-center mt-8">
              <Button onClick={handleTeamSelection} size="lg" className="bg-yellow-500 hover:bg-yellow-600">
                Confirm Team Selection
              </Button>
            </div>
          )}

          {error && (
            <div className="text-center mt-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Admin Access */}
        <div className="fixed bottom-4 left-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin')}
            className="text-xs text-gray-400 hover:text-white"
          >
            Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">IPL 2025</h1>
          <h2 className="text-2xl font-semibold text-blue-200 mb-4">Cricket Management Game</h2>
          <p className="text-blue-300">Manage your team, compete in auctions, and lead your franchise to victory!</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader>
            <div className="flex space-x-2">
              <Button 
                variant={showLogin ? "default" : "ghost"} 
                onClick={() => setShowLogin(true)}
                className="flex-1"
              >
                Login
              </Button>
              <Button 
                variant={!showLogin ? "default" : "ghost"} 
                onClick={() => setShowLogin(false)}
                className="flex-1"
              >
                Register
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {showLogin ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="loginId" className="text-white">User ID</Label>
                  <Input
                    id="loginId"
                    value={loginForm.id}
                    onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    placeholder="Enter your User ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginPassword" className="text-white">Password</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    placeholder="Enter your password"
                  />
                </div>
                <Button onClick={handleLogin} className="w-full bg-yellow-500 hover:bg-yellow-600">
                  Login
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="registerId" className="text-white">User ID</Label>
                  <Input
                    id="registerId"
                    value={registerForm.id}
                    onChange={(e) => setRegisterForm({ ...registerForm, id: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    placeholder="Choose a unique User ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPassword" className="text-white">Password</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    placeholder="Create a password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerName" className="text-white">Manager Name</Label>
                  <Input
                    id="managerName"
                    value={registerForm.managerName}
                    onChange={(e) => setRegisterForm({ ...registerForm, managerName: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    placeholder="Your name as team manager"
                  />
                </div>
                <Button onClick={handleRegister} className="w-full bg-green-500 hover:bg-green-600">
                  Register
                </Button>
              </>
            )}

            {error && (
              <div className="text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-blue-300 text-sm">
          <p>Join up to 10 managers in the ultimate IPL experience</p>
          <p>Manage your ₹100 crore budget wisely!</p>
        </div>

        {/* Admin Access */}
        <div className="fixed bottom-4 left-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin')}
            className="text-xs text-gray-400 hover:text-white"
          >
            Admin
          </Button>
        </div>
      </div>
    </div>
  );
}