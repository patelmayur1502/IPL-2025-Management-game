import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Users, Trophy, Target, TrendingUp } from 'lucide-react';
import { GameDatabase, Player, Team, getStarRating } from '@/lib/database';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<string>('');
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showPlayerDetail, setShowPlayerDetail] = useState(false);

  const db = GameDatabase.getInstance();
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('currentUser');
    if (!userId) {
      navigate('/');
      return;
    }

    setCurrentUser(userId);
    const team = db.getTeamByManager(userId);
    if (!team) {
      navigate('/');
      return;
    }

    setUserTeam(team);
  }, []);

  const StarRating = ({ rating }: { rating: number }) => {
    const { stars, color } = getStarRating(rating);
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: stars }, (_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${color === 'yellow' ? 'fill-yellow-400 text-yellow-400' : 'fill-red-500 text-red-500'}`}
          />
        ))}
        <span className="text-xs ml-1 font-medium">{rating}</span>
      </div>
    );
  };

  const PlayerDetailDialog = ({ player }: { player: Player }) => (
    <Dialog open={showPlayerDetail} onOpenChange={setShowPlayerDetail}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{player.name}</span>
            <Badge variant={player.capped ? 'default' : 'secondary'}>
              {player.capped ? 'Capped' : 'Uncapped'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Country</div>
              <div className="font-semibold">{player.country}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Age</div>
              <div className="font-semibold">{player.age} years</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Position</div>
              <div className="font-semibold">{player.position}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Acquired Price</div>
              <div className="font-semibold">₹{player.currentPrice || player.basePrice}L</div>
            </div>
          </div>

          {/* Skill Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Detailed Skill Ratings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Batting Skills */}
              <div className="space-y-3">
                <h4 className="font-medium text-blue-600 border-b pb-1">Batting Skills</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">vs Spin Bowling:</span>
                    <StarRating rating={player.battingSkillVsSpin} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">vs Seam Bowling:</span>
                    <StarRating rating={player.battingSkillVsSeam} />
                  </div>
                </div>
              </div>

              {/* Other Skills */}
              <div className="space-y-3">
                <h4 className="font-medium text-green-600 border-b pb-1">Other Skills</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bowling:</span>
                    <StarRating rating={player.bowlingSkill} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fielding:</span>
                    <StarRating rating={player.fieldingSkill} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Wicket Keeping:</span>
                    <StarRating rating={player.wicketKeepingSkill} />
                  </div>
                </div>
              </div>

              {/* Physical & Mental */}
              <div className="space-y-3">
                <h4 className="font-medium text-purple-600 border-b pb-1">Physical & Mental</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fitness:</span>
                    <StarRating rating={player.fitness} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Experience:</span>
                    <StarRating rating={player.experience} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Form:</span>
                    <StarRating rating={player.form} />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3">
                <h4 className="font-medium text-orange-600 border-b pb-1">Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Skill Points:</span>
                    <span className="font-bold text-lg">{player.skillPoints}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Sum of all skill ratings
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Playing Style */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Playing Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Batting Trait</div>
                <Badge variant="outline" className="mt-1">{player.trait}</Badge>
              </div>
              <div>
                <div className="text-sm text-gray-600">Batting Style</div>
                <div className="text-sm mt-1">{player.battingSubCategory}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Bowling Style</div>
                <div className="text-sm mt-1">{player.bowlingSubCategory}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const openPlayerDetail = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerDetail(true);
  };

  if (!userTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Setting up your dashboard...</p>
        </div>
      </div>
    );
  }

  const squadByPosition = {
    'Batsman': userTeam.squad.filter(p => p.position === 'Batsman'),
    'Bowler': userTeam.squad.filter(p => p.position === 'Bowler'),
    'All-rounder': userTeam.squad.filter(p => p.position === 'All-rounder'),
    'Wicket-keeper': userTeam.squad.filter(p => p.position === 'Wicket-keeper')
  };

  const totalSpent = userTeam.squad.reduce((sum, player) => sum + (player.currentPrice || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">{userTeam.name}</h1>
            <p className="text-red-200">Manager Dashboard - {currentUser}</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/auction')} className="bg-blue-600 hover:bg-blue-700">
              Go to Auction
            </Button>
            <Button onClick={() => navigate('/match')} className="bg-green-600 hover:bg-green-700">
              Play Match
            </Button>
            <Button onClick={() => navigate('/admin')} variant="outline">
              Admin Panel
            </Button>
          </div>
        </div>

        {/* Team Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userTeam.squad.length}/25</div>
              <div className="text-red-200 text-sm">Squad Size</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">₹{userTeam.budget}L</div>
              <div className="text-red-200 text-sm">Remaining Budget</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">₹{totalSpent}L</div>
              <div className="text-red-200 text-sm">Total Spent</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {userTeam.squad.reduce((sum, p) => sum + p.skillPoints, 0)}
              </div>
              <div className="text-red-200 text-sm">Total Skill Points</div>
            </CardContent>
          </Card>
        </div>

        {/* Squad Management */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">Squad Overview</TabsTrigger>
            <TabsTrigger value="batsmen" className="data-[state=active]:bg-white/20">Batsmen ({squadByPosition['Batsman'].length})</TabsTrigger>
            <TabsTrigger value="bowlers" className="data-[state=active]:bg-white/20">Bowlers ({squadByPosition['Bowler'].length})</TabsTrigger>
            <TabsTrigger value="allrounders" className="data-[state=active]:bg-white/20">All-rounders ({squadByPosition['All-rounder'].length})</TabsTrigger>
            <TabsTrigger value="keepers" className="data-[state=active]:bg-white/20">Wicket-keepers ({squadByPosition['Wicket-keeper'].length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Complete Squad</CardTitle>
              </CardHeader>
              <CardContent>
                {userTeam.squad.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-red-200 mb-4">No players in your squad yet!</p>
                    <Button onClick={() => navigate('/auction')} className="bg-blue-600 hover:bg-blue-700">
                      Start Building Your Team
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userTeam.squad.map((player) => (
                      <Card key={player.id} className="cursor-pointer hover:shadow-lg transition-all bg-white/5 border-white/20" onClick={() => openPlayerDetail(player)}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-white text-lg">{player.name}</CardTitle>
                            <Badge variant={player.capped ? 'default' : 'secondary'}>
                              {player.capped ? 'Capped' : 'Uncapped'}
                            </Badge>
                          </div>
                          <div className="flex gap-2 text-sm text-red-200">
                            <span>{player.country}</span>
                            <span>•</span>
                            <span>{player.age} years</span>
                            <span>•</span>
                            <span>{player.position}</span>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">Price:</span>
                            <span className="text-white font-bold">₹{player.currentPrice || player.basePrice}L</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between text-white">
                                <span>vs Spin:</span>
                                <StarRating rating={player.battingSkillVsSpin} />
                              </div>
                              <div className="flex justify-between text-white">
                                <span>vs Seam:</span>
                                <StarRating rating={player.battingSkillVsSeam} />
                              </div>
                              <div className="flex justify-between text-white">
                                <span>Bowling:</span>
                                <StarRating rating={player.bowlingSkill} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-white">
                                <span>Fielding:</span>
                                <StarRating rating={player.fieldingSkill} />
                              </div>
                              <div className="flex justify-between text-white">
                                <span>Fitness:</span>
                                <StarRating rating={player.fitness} />
                              </div>
                              <div className="flex justify-between text-white">
                                <span>Form:</span>
                                <StarRating rating={player.form} />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-white/20">
                            <span className="text-white font-medium">Skill Points:</span>
                            <span className="text-white font-bold">{player.skillPoints}</span>
                          </div>

                          <Badge variant="outline" className="text-xs text-white border-white/30">
                            {player.trait}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Position-wise tabs */}
          {Object.entries(squadByPosition).map(([position, players]) => (
            <TabsContent key={position} value={position.toLowerCase().replace('-', '')} className="space-y-6">
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">{position}s ({players.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {players.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-red-200 mb-4">No {position.toLowerCase()}s in your squad yet!</p>
                      <Button onClick={() => navigate('/auction')} className="bg-blue-600 hover:bg-blue-700">
                        Buy {position}s
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {players.map((player) => (
                        <Card key={player.id} className="cursor-pointer hover:shadow-lg transition-all bg-white/5 border-white/20" onClick={() => openPlayerDetail(player)}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-white text-lg">{player.name}</CardTitle>
                              <Badge variant={player.capped ? 'default' : 'secondary'}>
                                {player.capped ? 'Capped' : 'Uncapped'}
                              </Badge>
                            </div>
                            <div className="flex gap-2 text-sm text-red-200">
                              <span>{player.country}</span>
                              <span>•</span>
                              <span>{player.age} years</span>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">Price:</span>
                              <span className="text-white font-bold">₹{player.currentPrice || player.basePrice}L</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="space-y-1">
                                <div className="flex justify-between text-white">
                                  <span>vs Spin:</span>
                                  <StarRating rating={player.battingSkillVsSpin} />
                                </div>
                                <div className="flex justify-between text-white">
                                  <span>vs Seam:</span>
                                  <StarRating rating={player.battingSkillVsSeam} />
                                </div>
                                <div className="flex justify-between text-white">
                                  <span>Bowling:</span>
                                  <StarRating rating={player.bowlingSkill} />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-white">
                                  <span>Fielding:</span>
                                  <StarRating rating={player.fieldingSkill} />
                                </div>
                                <div className="flex justify-between text-white">
                                  <span>Fitness:</span>
                                  <StarRating rating={player.fitness} />
                                </div>
                                <div className="flex justify-between text-white">
                                  <span>Form:</span>
                                  <StarRating rating={player.form} />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-white/20">
                              <span className="text-white font-medium">Skill Points:</span>
                              <span className="text-white font-bold">{player.skillPoints}</span>
                            </div>

                            <Badge variant="outline" className="text-xs text-white border-white/30">
                              {player.trait}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Player Detail Dialog */}
        {selectedPlayer && <PlayerDetailDialog player={selectedPlayer} />}
      </div>
    </div>
  );
}