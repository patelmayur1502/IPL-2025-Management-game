import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GameDatabase, User, Team, Match } from '@/lib/database';
import { MatchEngine, OverResult, InningsResult, MatchResult } from '@/lib/gameEngine';
import { useNavigate } from 'react-router-dom';

export default function MatchPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [liveMatch, setLiveMatch] = useState<MatchResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentOver, setCurrentOver] = useState(0);
  const [currentInnings, setCurrentInnings] = useState(1);
  const [liveScore, setLiveScore] = useState({ runs: 0, wickets: 0 });
  const [commentary, setCommentary] = useState<string[]>([]);

  const db = GameDatabase.getInstance();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      
      if (user.teamId) {
        const team = db.getTeamByManager(user.id);
        setUserTeam(team);
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }

    loadData();
  }, []);

  const loadData = () => {
    setAllTeams(db.getTeams());
    setMatches(db.getMatches());
  };

  const generateRandomMatch = () => {
    const teamsWithSquads = db.getTeams().filter(team => team.squad && team.squad.length >= 11);
    
    if (teamsWithSquads.length < 2) {
      alert('Need at least 2 teams with complete squads to generate matches!');
      return;
    }

    const team1 = teamsWithSquads[Math.floor(Math.random() * teamsWithSquads.length)];
    let team2 = teamsWithSquads[Math.floor(Math.random() * teamsWithSquads.length)];
    
    // Ensure different teams
    while (team2.id === team1.id) {
      team2 = teamsWithSquads[Math.floor(Math.random() * teamsWithSquads.length)];
    }

    const newMatch: Match = {
      id: `match_${Date.now()}`,
      team1: team1.name,
      team2: team2.name,
      venue: 'Wankhede Stadium, Mumbai',
      date: new Date().toLocaleDateString(),
      status: 'upcoming'
    };

    db.createMatch(newMatch);
    setMatches([...matches, newMatch]);
  };

  const simulateMatch = async (match: Match) => {
    const team1 = allTeams.find(t => t.name === match.team1);
    const team2 = allTeams.find(t => t.name === match.team2);
    
    if (!team1 || !team2) return;

    setIsSimulating(true);
    setCurrentOver(0);
    setCurrentInnings(1);
    setLiveScore({ runs: 0, wickets: 0 });
    setCommentary([`🏏 Match started: ${team1.name} vs ${team2.name}`]);

    const engine = new MatchEngine(team1, team2);

    // Update match status to live
    const updatedMatch = { ...match, status: 'live' as const };
    db.updateMatch(updatedMatch);

    await engine.simulateMatchLive(
      (overResult: OverResult, inningsRuns: number, inningsWickets: number) => {
        setCurrentOver(prev => prev + 1);
        setLiveScore({ runs: inningsRuns, wickets: inningsWickets });
        setCommentary(prev => [
          ...prev,
          `Over ${Math.floor(currentOver) + 1}: ${overResult.runs} runs, ${overResult.wickets} wickets. Score: ${inningsRuns}/${inningsWickets}`
        ]);
      },
      (inningsResult: InningsResult) => {
        setCurrentInnings(2);
        setCurrentOver(0);
        setLiveScore({ runs: 0, wickets: 0 });
        setCommentary(prev => [
          ...prev,
          `🔄 Innings break! Target: ${inningsResult.runs + 1} runs`
        ]);
      },
      (matchResult: MatchResult) => {
        setLiveMatch(matchResult);
        setIsSimulating(false);
        
        // Update match with result
        const finalMatch = {
          ...updatedMatch,
          status: 'completed' as const,
          result: {
            winner: matchResult.winner,
            team1Score: `${matchResult.team1Innings.runs}/${matchResult.team1Innings.wickets}`,
            team2Score: `${matchResult.team2Innings.runs}/${matchResult.team2Innings.wickets}`,
            margin: matchResult.margin
          }
        };
        
        db.updateMatch(finalMatch);
        setCommentary(prev => [
          ...prev,
          `🏆 Match finished! ${matchResult.matchSummary}`
        ]);
      }
    );
  };

  if (!currentUser || !userTeam) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">IPL Matches</h1>
            <p className="text-blue-200">Live match simulation with 1 minute per over</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={generateRandomMatch} className="bg-green-500 hover:bg-green-600">
              Generate Random Match
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Live Match */}
        {isSimulating && (
          <Card className="bg-white/10 border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">🔴 LIVE MATCH</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">
                  Innings {currentInnings} - Over {currentOver}/20
                </h3>
                <div className="text-3xl font-bold text-yellow-400 mt-2">
                  {liveScore.runs}/{liveScore.wickets}
                </div>
                <Progress value={(currentOver / 20) * 100} className="mt-4" />
              </div>
              
              <div className="bg-black/30 rounded-lg p-4 max-h-40 overflow-y-auto">
                <h4 className="text-white font-semibold mb-2">Live Commentary</h4>
                {commentary.slice(-5).map((comment, index) => (
                  <p key={index} className="text-blue-200 text-sm mb-1">{comment}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Result */}
        {liveMatch && (
          <Card className="bg-white/10 border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Match Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  {liveMatch.team1} vs {liveMatch.team2}
                </h3>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white">{liveMatch.team1}</h4>
                    <div className="text-2xl font-bold text-blue-300">
                      {liveMatch.team1Innings.runs}/{liveMatch.team1Innings.wickets}
                    </div>
                    <div className="text-sm text-blue-200">
                      ({liveMatch.team1Innings.overs} overs)
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white">{liveMatch.team2}</h4>
                    <div className="text-2xl font-bold text-blue-300">
                      {liveMatch.team2Innings.runs}/{liveMatch.team2Innings.wickets}
                    </div>
                    <div className="text-sm text-blue-200">
                      ({liveMatch.team2Innings.overs} overs)
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Badge className="bg-yellow-500 text-black text-lg px-4 py-2">
                    🏆 {liveMatch.winner} won by {liveMatch.margin}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match List */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">All Matches</CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold">
                          {match.team1} vs {match.team2}
                        </h3>
                        <p className="text-blue-200 text-sm">
                          {match.venue} • {match.date}
                        </p>
                        {match.result && (
                          <p className="text-green-400 text-sm mt-1">
                            {match.result.winner} won by {match.result.margin}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={
                            match.status === 'live' ? 'destructive' :
                            match.status === 'completed' ? 'default' : 'secondary'
                          }
                        >
                          {match.status.toUpperCase()}
                        </Badge>
                        
                        {match.status === 'upcoming' && (
                          <Button 
                            onClick={() => simulateMatch(match)}
                            disabled={isSimulating}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {isSimulating ? 'Simulating...' : 'Start Match'}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {match.result && (
                      <div className="mt-2 text-sm text-blue-200">
                        {match.team1}: {match.result.team1Score} | {match.team2}: {match.result.team2Score}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white mb-4">No matches scheduled yet!</p>
                <Button onClick={generateRandomMatch} className="bg-green-500 hover:bg-green-600">
                  Generate First Match
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}