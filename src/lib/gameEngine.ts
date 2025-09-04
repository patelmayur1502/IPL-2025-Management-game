// Match simulation engine for IPL Cricket Management Game

import { Player, Team } from './database';

export interface BallResult {
  runs: number;
  isWicket: boolean;
  isBoundary: boolean;
  extras: number;
  wicketType?: string;
  commentary: string;
}

export interface OverResult {
  balls: BallResult[];
  runs: number;
  wickets: number;
  bowler: string;
  batsmen: string[];
}

export interface InningsResult {
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  overResults: OverResult[];
  batsmen: { name: string; runs: number; balls: number; fours: number; sixes: number }[];
  bowlers: { name: string; overs: number; runs: number; wickets: number; economy: number }[];
}

export interface MatchResult {
  team1: string;
  team2: string;
  team1Innings: InningsResult;
  team2Innings: InningsResult;
  winner: string;
  margin: string;
  matchSummary: string;
}

export class MatchEngine {
  private team1: Team;
  private team2: Team;
  private team1Playing11: Player[];
  private team2Playing11: Player[];
  private currentInnings: 1 | 2 = 1;
  private currentOver: number = 0;
  private currentBall: number = 0;
  private currentBatsmen: [Player, Player] = [null!, null!];
  private currentBowler: Player = null!;
  private onStrike: 0 | 1 = 0;

  constructor(team1: Team, team2: Team) {
    this.team1 = team1;
    this.team2 = team2;
    this.team1Playing11 = this.selectPlaying11(team1);
    this.team2Playing11 = this.selectPlaying11(team2);
  }

  private selectPlaying11(team: Team): Player[] {
    // Simple selection logic - take first 11 players
    // In full version, this would be manager's selection
    const squad = team.squad.slice(0, 11);
    return squad.length >= 11 ? squad : [];
  }

  private calculatePlayerRating(player: Player, role: 'batting' | 'bowling', opponent?: Player): number {
    let baseRating = 0;
    
    if (role === 'batting') {
      baseRating = player.battingSkill;
    } else {
      baseRating = player.bowlingSkill;
    }

    // Factor in form, fitness, and experience
    const formFactor = player.form / 20;
    const fitnessFactor = player.fitness / 20;
    const experienceFactor = player.experience / 20;

    const adjustedRating = baseRating * (0.6 + 0.2 * formFactor + 0.1 * fitnessFactor + 0.1 * experienceFactor);
    
    return Math.min(20, Math.max(1, Math.round(adjustedRating)));
  }

  private simulateBall(batsman: Player, bowler: Player): BallResult {
    const batsmanRating = this.calculatePlayerRating(batsman, 'batting', bowler);
    const bowlerRating = this.calculatePlayerRating(bowler, 'bowling', batsman);

    // Simple probability calculation
    const batsmanAdvantage = batsmanRating - bowlerRating;
    const randomFactor = Math.random() * 10 - 5; // -5 to +5
    const outcome = batsmanAdvantage + randomFactor;

    let runs = 0;
    let isWicket = false;
    let isBoundary = false;
    let commentary = '';

    if (outcome > 6) {
      runs = 6;
      isBoundary = true;
      commentary = `${batsman.name} hits it out of the park! SIX!`;
    } else if (outcome > 4) {
      runs = 4;
      isBoundary = true;
      commentary = `${batsman.name} finds the gap! FOUR!`;
    } else if (outcome > 2) {
      runs = Math.floor(Math.random() * 3) + 1;
      commentary = `${batsman.name} takes ${runs} run${runs > 1 ? 's' : ''}`;
    } else if (outcome > 0) {
      runs = 0;
      commentary = `Dot ball. Good bowling by ${bowler.name}`;
    } else if (outcome > -3) {
      runs = 0;
      commentary = `Close call! ${batsman.name} survives`;
    } else {
      isWicket = true;
      commentary = `OUT! ${batsman.name} is dismissed by ${bowler.name}`;
    }

    return {
      runs,
      isWicket,
      isBoundary,
      extras: 0,
      commentary
    };
  }

  private simulateOver(battingTeam: Player[], bowlingTeam: Player[]): OverResult {
    const bowler = bowlingTeam[Math.floor(Math.random() * 5)]; // Random bowler from 5 bowling options
    const balls: BallResult[] = [];
    let overRuns = 0;
    let overWickets = 0;

    for (let ball = 0; ball < 6; ball++) {
      const batsman = this.currentBatsmen[this.onStrike];
      const ballResult = this.simulateBall(batsman, bowler);
      
      balls.push(ballResult);
      overRuns += ballResult.runs;
      
      if (ballResult.isWicket) {
        overWickets++;
        // New batsman comes in (simplified)
        const newBatsmanIndex = Math.floor(Math.random() * battingTeam.length);
        this.currentBatsmen[this.onStrike] = battingTeam[newBatsmanIndex];
      }

      // Change strike if odd runs
      if (ballResult.runs % 2 === 1) {
        this.onStrike = this.onStrike === 0 ? 1 : 0;
      }
    }

    // Change strike at end of over
    this.onStrike = this.onStrike === 0 ? 1 : 0;

    return {
      balls,
      runs: overRuns,
      wickets: overWickets,
      bowler: bowler.name,
      batsmen: [this.currentBatsmen[0].name, this.currentBatsmen[1].name]
    };
  }

  public async simulateMatch(): Promise<MatchResult> {
    // Simplified match simulation
    const team1Innings: InningsResult = {
      runs: Math.floor(Math.random() * 100) + 120, // 120-220 runs
      wickets: Math.floor(Math.random() * 8) + 2, // 2-10 wickets
      overs: 20,
      balls: 0,
      overResults: [],
      batsmen: [],
      bowlers: []
    };

    const team2Innings: InningsResult = {
      runs: Math.floor(Math.random() * 100) + 120,
      wickets: Math.floor(Math.random() * 8) + 2,
      overs: 20,
      balls: 0,
      overResults: [],
      batsmen: [],
      bowlers: []
    };

    // Determine winner
    let winner: string;
    let margin: string;

    if (team1Innings.runs > team2Innings.runs) {
      winner = this.team1.name;
      margin = `${team1Innings.runs - team2Innings.runs} runs`;
    } else if (team2Innings.runs > team1Innings.runs) {
      winner = this.team2.name;
      margin = `${10 - team2Innings.wickets} wickets`;
    } else {
      winner = 'Tie';
      margin = 'Match tied';
    }

    return {
      team1: this.team1.name,
      team2: this.team2.name,
      team1Innings,
      team2Innings,
      winner,
      margin,
      matchSummary: `${winner} won by ${margin}`
    };
  }

  // Real-time match simulation with 1 minute per over
  public async simulateMatchLive(
    onOverComplete: (overResult: OverResult, inningsRuns: number, inningsWickets: number) => void,
    onInningsComplete: (inningsResult: InningsResult) => void,
    onMatchComplete: (matchResult: MatchResult) => void
  ): Promise<void> {
    
    // Simulate first innings
    let inningsRuns = 0;
    let inningsWickets = 0;
    const overResults: OverResult[] = [];

    for (let over = 0; over < 20; over++) {
      await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute per over
      
      const overResult: OverResult = {
        balls: [],
        runs: Math.floor(Math.random() * 15) + 3, // 3-18 runs per over
        wickets: Math.random() < 0.3 ? 1 : 0, // 30% chance of wicket
        bowler: `Bowler ${over + 1}`,
        batsmen: ['Batsman 1', 'Batsman 2']
      };

      inningsRuns += overResult.runs;
      inningsWickets += overResult.wickets;
      overResults.push(overResult);

      onOverComplete(overResult, inningsRuns, inningsWickets);

      if (inningsWickets >= 10) break;
    }

    const firstInnings: InningsResult = {
      runs: inningsRuns,
      wickets: inningsWickets,
      overs: Math.min(20, overResults.length),
      balls: 0,
      overResults,
      batsmen: [],
      bowlers: []
    };

    onInningsComplete(firstInnings);

    // Simulate second innings
    inningsRuns = 0;
    inningsWickets = 0;
    const secondInningsOvers: OverResult[] = [];

    for (let over = 0; over < 20; over++) {
      await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute per over
      
      const overResult: OverResult = {
        balls: [],
        runs: Math.floor(Math.random() * 15) + 3,
        wickets: Math.random() < 0.3 ? 1 : 0,
        bowler: `Bowler ${over + 1}`,
        batsmen: ['Batsman 1', 'Batsman 2']
      };

      inningsRuns += overResult.runs;
      inningsWickets += overResult.wickets;
      secondInningsOvers.push(overResult);

      onOverComplete(overResult, inningsRuns, inningsWickets);

      // Check if target is reached
      if (inningsRuns > firstInnings.runs) break;
      if (inningsWickets >= 10) break;
    }

    const secondInnings: InningsResult = {
      runs: inningsRuns,
      wickets: inningsWickets,
      overs: Math.min(20, secondInningsOvers.length),
      balls: 0,
      overResults: secondInningsOvers,
      batsmen: [],
      bowlers: []
    };

    onInningsComplete(secondInnings);

    // Determine winner
    let winner: string;
    let margin: string;

    if (firstInnings.runs > secondInnings.runs) {
      winner = this.team1.name;
      margin = `${firstInnings.runs - secondInnings.runs} runs`;
    } else if (secondInnings.runs > firstInnings.runs) {
      winner = this.team2.name;
      margin = `${10 - secondInnings.wickets} wickets`;
    } else {
      winner = 'Tie';
      margin = 'Match tied';
    }

    const matchResult: MatchResult = {
      team1: this.team1.name,
      team2: this.team2.name,
      team1Innings: firstInnings,
      team2Innings: secondInnings,
      winner,
      margin,
      matchSummary: `${winner} won by ${margin}`
    };

    onMatchComplete(matchResult);
  }
}