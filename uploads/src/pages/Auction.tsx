import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Users, Trophy, Target } from 'lucide-react';
import { GameDatabase, Player, Team, getStarRating } from '@/lib/database';
import { useNavigate } from 'react-router-dom';

export default function Auction() {
  const [currentUser, setCurrentUser] = useState<string>('');
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showPlayerDetail, setShowPlayerDetail] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [auctionPhase, setAuctionPhase] = useState<'draft' | 'main'>('draft');
  const [draftedPlayers, setDraftedPlayers] = useState<Player[]>([]);
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('skillPoints');

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
    loadAvailablePlayers();
    loadDraftedPlayers();
  }, []);

  const loadAvailablePlayers = () => {
    const players = db.getAvailablePlayers();
    setAvailablePlayers(players);
  };

  const loadDraftedPlayers = () => {
    const allPlayers = db.getPlayers();
    const drafted = allPlayers.filter(p => p.team && p.currentPrice === 500); // Draft price is 500L (5 crores)
    setDraftedPlayers(drafted);
  };

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
              <div className="text-sm text-gray-600">Base Price</div>
              <div className="font-semibold">₹{player.basePrice}L</div>
            </div>
          </div>

          {/* Skill Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Skill Ratings
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

          {/* Auction Actions */}
          {auctionPhase === 'draft' && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => handleDraftPlayer(player)}
                disabled={!userTeam || userTeam.budget < 500 || userTeam.squad.length >= 25}
                className="flex-1"
              >
                Draft for ₹5 Crores
              </Button>
            </div>
          )}

          {auctionPhase === 'main' && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Bid amount (₹L)"
                  value={bidAmount || ''}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  min={player.basePrice}
                />
                <Button
                  onClick={() => handleBidPlayer(player)}
                  disabled={!userTeam || bidAmount < player.basePrice || userTeam.budget < bidAmount}
                >
                  Place Bid
                </Button>
              </div>
              <div className="text-xs text-gray-600">
                Minimum bid: ₹{player.basePrice}L | Your budget: ₹{userTeam?.budget}L
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  const handleDraftPlayer = (player: Player) => {
    if (!userTeam || userTeam.budget < 500 || userTeam.squad.length >= 25) return;

    // Update player
    const updatedPlayer = { ...player, team: userTeam.id, currentPrice: 500 };
    db.updatePlayer(updatedPlayer);

    // Update team
    const updatedTeam = {
      ...userTeam,
      budget: userTeam.budget - 500,
      squad: [...userTeam.squad, updatedPlayer]
    };
    db.updateTeam(updatedTeam);
    setUserTeam(updatedTeam);

    loadAvailablePlayers();
    loadDraftedPlayers();
    setShowPlayerDetail(false);
    alert(`${player.name} drafted successfully for ₹5 crores!`);
  };

  const handleBidPlayer = (player: Player) => {
    if (!userTeam || bidAmount < player.basePrice || userTeam.budget < bidAmount) return;

    // Simple auction - immediate win
    const updatedPlayer = { ...player, team: userTeam.id, currentPrice: bidAmount };
    db.updatePlayer(updatedPlayer);

    const updatedTeam = {
      ...userTeam,
      budget: userTeam.budget - bidAmount,
      squad: [...userTeam.squad, updatedPlayer]
    };
    db.updateTeam(updatedTeam);
    setUserTeam(updatedTeam);

    loadAvailablePlayers();
    setBidAmount(0);
    setShowPlayerDetail(false);
    alert(`${player.name} acquired for ₹${bidAmount}L!`);
  };

  const openPlayerDetail = (player: Player) => {
    setSelectedPlayer(player);
    setBidAmount(player.basePrice);
    setShowPlayerDetail(true);
  };

  const filteredAndSortedPlayers = availablePlayers
    .filter(player => filterPosition === 'all' || player.position === filterPosition)
    .sort((a, b) => {
      switch (sortBy) {
        case 'skillPoints':
          return b.skillPoints - a.skillPoints;
        case 'basePrice':
          return b.basePrice - a.basePrice;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return a.age - b.age;
        default:
          return 0;
      }
    });

  if (!userTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Setting up auction room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">IPL 2025 Auction</h1>
            <p className="text-red-200">{userTeam.name} - Budget: ₹{userTeam.budget}L</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Team Status */}
        <Card className="mb-6 bg-white/10 border-white/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{userTeam.squad.length}/25</div>
                <div className="text-red-200 text-sm">Squad Size</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">₹{userTeam.budget}L</div>
                <div className="text-red-200 text-sm">Remaining Budget</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{draftedPlayers.filter(p => p.team === userTeam.id).length}</div>
                <div className="text-red-200 text-sm">Drafted Players</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{availablePlayers.length}</div>
                <div className="text-red-200 text-sm">Available Players</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auction Tabs */}
        <Tabs value={auctionPhase} onValueChange={(value) => setAuctionPhase(value as 'draft' | 'main')} className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="draft" className="data-[state=active]:bg-white/20">
              Draft Auction (₹5L each)
            </TabsTrigger>
            <TabsTrigger value="main" className="data-[state=active]:bg-white/20">
              Main Auction
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draft" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Draft Auction - ₹5 Crores per player
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className="px-3 py-2 rounded bg-white/20 text-white border border-white/30"
                  >
                    <option value="all">All Positions</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicket-keeper">Wicket-keeper</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded bg-white/20 text-white border border-white/30"
                  >
                    <option value="skillPoints">Sort by Skill Points</option>
                    <option value="basePrice">Sort by Base Price</option>
                    <option value="name">Sort by Name</option>
                    <option value="age">Sort by Age</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedPlayers.slice(0, 12).map((player) => (
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="main" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Main Auction - Bidding War
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className="px-3 py-2 rounded bg-white/20 text-white border border-white/30"
                  >
                    <option value="all">All Positions</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicket-keeper">Wicket-keeper</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded bg-white/20 text-white border border-white/30"
                  >
                    <option value="skillPoints">Sort by Skill Points</option>
                    <option value="basePrice">Sort by Base Price</option>
                    <option value="name">Sort by Name</option>
                    <option value="age">Sort by Age</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedPlayers.map((player) => (
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
                          <span className="text-white font-medium">Base Price:</span>
                          <span className="text-white font-bold">₹{player.basePrice}L</span>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Player Detail Dialog */}
        {selectedPlayer && <PlayerDetailDialog player={selectedPlayer} />}
      </div>
    </div>
  );
}