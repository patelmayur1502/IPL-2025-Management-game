// Enhanced Player interface with comprehensive attributes
export interface Player {
  id: string;
  name: string;
  basePrice: number;
  country: string;
  age: number;
  position: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper';
  
  // Basic skills (1-100 scale)
  bowlingSkill: number;
  fieldingSkill: number;
  wicketKeepingSkill: number;
  
  // Batting attributes
  battingAttributes: {
    vsSpin: number;
    vsSeam: number;
  };
  
  // Bowling attributes
  bowlingAttributes: {
    mainBowling: 'Fast' | 'Medium' | 'Spin-Off' | 'Spin-Leg' | 'Spin-Left' | 'None';
    variation: 'Yorker' | 'Bouncer' | 'Slower' | 'Googly' | 'Doosra' | 'Carrom' | 'None';
    pace: number;
    spin: number;
    control: number;
  };
  
  // Fielding attributes
  fieldingAttributes: {
    catching: number;
    throwing: number;
    groundFielding: number;
  };
  
  // Wicket-keeping attributes
  wicketKeepingAttributes: {
    stumping: number;
    catching: number;
  };
  
  // Player traits
  traits: {
    battingPosition: 'Top Order' | 'Middle Order' | 'Lower Order' | 'None';
    bowlingSpecialty: 'Power Play Specialist' | 'Middle Overs Specialist' | 'Death Specialist' | 'None';
  };
  
  battingStyle: 'RHB' | 'LHB';
  bowlingStyle: string;
  capped: boolean;
  skillPoints: number;
  
  // Player form and fitness
  form: number;
  fitness: number;
  experience: number;
  
  // Team assignment
  teamId?: string;
  team?: string; // Legacy compatibility
  
  // Player statistics
  statistics: {
    matches: number;
    // Batting stats
    runs: number;
    ballsFaced: number;
    highestScore: number;
    fifties: number;
    hundreds: number;
    fours: number;
    sixes: number;
    // Bowling stats
    wickets: number;
    ballsBowled: number;
    runsConceded: number;
    bestBowling: {
      wickets: number;
      runs: number;
    };
    // Fielding stats
    catches: number;
    runOuts: number;
    stumpings: number;
  };
  
  // Current price in auction
  currentPrice?: number;
  isSold: boolean;
  
  // Legacy compatibility
  battingSkillVsSpin: number;
  battingSkillVsSeam: number;
  trait: string;
  battingSubCategory: string;
  bowlingSubCategory: string;
}

export interface User {
  id: string;
  password: string;
  managerName: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  manager?: string;
  budget: number;
  squad: Player[];
  draftPicks: Player[];
}

export interface MatchConditions {
  pitchType: 'dusty' | 'green' | 'flat' | 'standard';
  weather: 'sunny' | 'overcast' | 'rainy';
  venue: string;
}

// Helper function to calculate star rating
export function calculateStarRating(player: Player, matchConditions?: MatchConditions): number {
  let rating = 0;

  // Add skill points to base rating
  rating += player.skillPoints * 0.5;
  
  // Base attributes contribution
  if (player.position === 'Batsman' || player.position === 'All-rounder' || player.position === 'Wicket-keeper') {
    const spinContribution = player.battingAttributes.vsSpin * 0.2;
    const seamContribution = player.battingAttributes.vsSeam * 0.2;
    rating += player.fieldingSkill * 0.1;
    
    if (player.position === 'Wicket-keeper') {
      rating += player.wicketKeepingSkill * 0.1;
    }
    
    // Adjust based on pitch type if conditions provided
    if (matchConditions) {
      if (matchConditions.pitchType === 'dusty') {
        rating += spinContribution * 1.2 + seamContribution * 0.8;
      } else if (matchConditions.pitchType === 'green') {
        rating += spinContribution * 0.8 + seamContribution * 1.2;
      } else {
        rating += spinContribution + seamContribution;
      }
    } else {
      rating += spinContribution + seamContribution;
    }
  }
  
  if (player.position === 'Bowler' || player.position === 'All-rounder') {
    let bowlingRating = 0;
    
    if (player.bowlingAttributes.mainBowling.includes('Spin')) {
      bowlingRating = player.bowlingAttributes.spin * 0.3 + player.bowlingAttributes.control * 0.2;
      rating += player.bowlingSkill * 0.1;
      
      if (matchConditions) {
        if (matchConditions.pitchType === 'dusty') {
          bowlingRating *= 1.2;
        } else if (matchConditions.pitchType === 'green') {
          bowlingRating *= 0.9;
        }
      }
    } else {
      bowlingRating = player.bowlingAttributes.pace * 0.3 + player.bowlingAttributes.control * 0.2;
      rating += player.bowlingSkill * 0.1;
      
      if (matchConditions) {
        if (matchConditions.pitchType === 'green') {
          bowlingRating *= 1.2;
        } else if (matchConditions.pitchType === 'dusty') {
          bowlingRating *= 0.9;
        }
      }
    }
    
    rating += bowlingRating;
  }
  
  // Add contribution from form, fitness and experience
  rating += (player.form / 100) * 10;
  rating += (player.fitness / 100) * 5;
  rating += Math.min(player.experience / 50, 1) * 10;
  
  // Weather conditions effect
  if (matchConditions?.weather === 'overcast' && 
      (player.position === 'Bowler' || player.position === 'All-rounder') && 
      !player.bowlingAttributes.mainBowling.includes('Spin')) {
    rating += 3;
  }
  
  return Math.min(Math.round(rating), 100);
}

// Helper function to get star display info
export function getStarRating(rating: number): { stars: number; color: string } {
  let color: string;
  let stars: number;
  
  if (rating <= 20) {
    color = 'yellow';
    stars = Math.ceil(rating / 2);
  } else if (rating <= 40) {
    color = 'red';
    stars = Math.ceil((rating % 20 === 0 ? 20 : rating % 20) / 2);
  } else if (rating <= 60) {
    color = 'orange';
    stars = Math.ceil((rating % 20 === 0 ? 20 : rating % 20) / 2);
  } else if (rating <= 80) {
    color = 'blue';
    stars = Math.ceil((rating % 20 === 0 ? 20 : rating % 20) / 2);
  } else if (rating <= 100) {
    color = 'green';
    stars = Math.ceil((rating % 20 === 0 ? 20 : rating % 20) / 2);
  } else {
    color = 'purple';
    stars = 10;
  }
  
  return { stars: Math.max(1, stars), color };
}

// Create enhanced sample players with all attributes
function createEnhancedPlayer(
  id: string,
  name: string,
  country: string,
  age: number,
  position: Player['position'],
  basePrice: number,
  overrides: Partial<Player> = {}
): Player {
  const defaultStats = {
    matches: 0,
    runs: 0,
    ballsFaced: 0,
    highestScore: 0,
    fifties: 0,
    hundreds: 0,
    fours: 0,
    sixes: 0,
    wickets: 0,
    ballsBowled: 0,
    runsConceded: 0,
    bestBowling: { wickets: 0, runs: 0 },
    catches: 0,
    runOuts: 0,
    stumpings: 0
  };

  const baseBattingVsSpin = Math.floor(Math.random() * 20) + 1;
  const baseBattingVsSeam = Math.floor(Math.random() * 20) + 1;
  const baseBowlingSkill = Math.floor(Math.random() * 20) + 1;
  const baseFieldingSkill = Math.floor(Math.random() * 20) + 1;
  const baseWicketKeepingSkill = position === 'Wicket-keeper' ? Math.floor(Math.random() * 20) + 1 : 1;

  const player: Player = {
    id,
    name,
    country,
    age,
    position,
    basePrice,
    
    // Basic skills
    bowlingSkill: baseBowlingSkill,
    fieldingSkill: baseFieldingSkill,
    wicketKeepingSkill: baseWicketKeepingSkill,
    
    // Batting attributes
    battingAttributes: {
      vsSpin: baseBattingVsSpin,
      vsSeam: baseBattingVsSeam
    },
    
    // Bowling attributes
    bowlingAttributes: {
      mainBowling: position === 'Bowler' || position === 'All-rounder' 
        ? ['Fast', 'Medium', 'Spin-Off', 'Spin-Leg', 'Spin-Left'][Math.floor(Math.random() * 5)] as Player['bowlingAttributes']['mainBowling']
        : 'None',
      variation: ['Yorker', 'Bouncer', 'Slower', 'Googly', 'Doosra', 'Carrom', 'None'][Math.floor(Math.random() * 7)] as Player['bowlingAttributes']['variation'],
      pace: Math.floor(Math.random() * 100),
      spin: Math.floor(Math.random() * 100),
      control: Math.floor(Math.random() * 100)
    },
    
    // Fielding attributes
    fieldingAttributes: {
      catching: Math.floor(Math.random() * 100) + 1,
      throwing: Math.floor(Math.random() * 100) + 1,
      groundFielding: Math.floor(Math.random() * 100) + 1
    },
    
    // Wicket-keeping attributes
    wicketKeepingAttributes: {
      stumping: position === 'Wicket-keeper' ? Math.floor(Math.random() * 100) + 1 : 0,
      catching: position === 'Wicket-keeper' ? Math.floor(Math.random() * 100) + 1 : 0
    },
    
    // Player traits
    traits: {
      battingPosition: ['Top Order', 'Middle Order', 'Lower Order', 'None'][Math.floor(Math.random() * 4)] as Player['traits']['battingPosition'],
      bowlingSpecialty: position === 'Bowler' || position === 'All-rounder'
        ? ['Power Play Specialist', 'Middle Overs Specialist', 'Death Specialist', 'None'][Math.floor(Math.random() * 4)] as Player['traits']['bowlingSpecialty']
        : 'None'
    },
    
    battingStyle: Math.random() > 0.5 ? 'RHB' : 'LHB',
    bowlingStyle: position === 'Bowler' || position === 'All-rounder' 
      ? ['Right-arm fast', 'Left-arm fast', 'Right-arm off-spin', 'Left-arm orthodox', 'Leg-spin'][Math.floor(Math.random() * 5)]
      : 'None',
    capped: Math.random() > 0.3,
    skillPoints: baseBattingVsSpin + baseBattingVsSeam + baseBowlingSkill + baseFieldingSkill + baseWicketKeepingSkill,
    
    // Player form and fitness
    form: Math.floor(Math.random() * 50) + 50,
    fitness: Math.floor(Math.random() * 20) + 80,
    experience: Math.floor(Math.random() * 100),
    
    // Player statistics
    statistics: defaultStats,
    
    // Current price and sold status
    currentPrice: 0,
    isSold: false,
    
    // Legacy compatibility
    battingSkillVsSpin: baseBattingVsSpin,
    battingSkillVsSeam: baseBattingVsSeam,
    trait: ['Aggressive', 'Defensive', 'Balanced', 'Power Hitter', 'Anchor'][Math.floor(Math.random() * 5)],
    battingSubCategory: Math.random() > 0.5 ? 'Right-handed' : 'Left-handed',
    bowlingSubCategory: position === 'Bowler' || position === 'All-rounder' 
      ? ['Fast', 'Medium', 'Spin'][Math.floor(Math.random() * 3)]
      : 'None',
    
    ...overrides
  };

  return player;
}

// Sample players for testing
export const SAMPLE_PLAYERS: Player[] = [
  createEnhancedPlayer('sample_1', 'Rohit Sharma', 'India', 36, 'Batsman', 14, {
    battingAttributes: { vsSpin: 17, vsSeam: 18 },
    bowlingSkill: 6,
    fieldingSkill: 15,
    capped: true,
    form: 82,
    fitness: 88,
    experience: 180
  }),
  createEnhancedPlayer('sample_2', 'Kagiso Rabada', 'South Africa', 28, 'Bowler', 11, {
    bowlingAttributes: {
      mainBowling: 'Fast',
      variation: 'Bouncer',
      pace: 92,
      spin: 15,
      control: 85
    },
    bowlingSkill: 18,
    fieldingSkill: 13,
    capped: true,
    form: 87,
    fitness: 92,
    experience: 75
  }),
  createEnhancedPlayer('sample_3', 'Jos Buttler', 'England', 33, 'Wicket-keeper', 10, {
    wicketKeepingSkill: 18,
    wicketKeepingAttributes: { stumping: 88, catching: 92 },
    battingAttributes: { vsSpin: 15, vsSeam: 17 },
    fieldingSkill: 16,
    capped: true,
    form: 79,
    fitness: 86,
    experience: 120
  })
];

export class GameDatabase {
  private static instance: GameDatabase;
  private players: Player[] = [];
  private teams: Team[] = [];
  private users: User[] = [];

  private constructor() {
    this.initializeData();
  }

  static getInstance(): GameDatabase {
    if (!GameDatabase.instance) {
      GameDatabase.instance = new GameDatabase();
    }
    return GameDatabase.instance;
  }

  public initializeDatabase() {
    this.players = this.createDefaultPlayers();
    this.teams = this.createDefaultTeams();
    this.users = [];
    this.savePlayersToStorage();
    this.saveTeamsToStorage();
    this.saveUsersToStorage();
  }

  private initializeData() {
    // Load from localStorage or create default data
    this.loadFromStorage();
  }

  private loadFromStorage() {
    // Load players
    const storedPlayers = localStorage.getItem('ipl_players');
    if (storedPlayers) {
      this.players = JSON.parse(storedPlayers);
    } else {
      this.players = this.createDefaultPlayers();
      this.savePlayersToStorage();
    }

    // Load teams
    const storedTeams = localStorage.getItem('ipl_teams');
    if (storedTeams) {
      this.teams = JSON.parse(storedTeams);
    } else {
      this.teams = this.createDefaultTeams();
      this.saveTeamsToStorage();
    }

    // Load users
    const storedUsers = localStorage.getItem('ipl_users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
  }

  private createDefaultPlayers(): Player[] {
    return [
      createEnhancedPlayer('1', 'Virat Kohli', 'India', 35, 'Batsman', 15, {
        battingAttributes: { vsSpin: 18, vsSeam: 19 },
        bowlingSkill: 5,
        fieldingSkill: 16,
        capped: true,
        form: 85,
        fitness: 95,
        experience: 150
      }),
      createEnhancedPlayer('2', 'Jasprit Bumrah', 'India', 30, 'Bowler', 12, {
        bowlingAttributes: {
          mainBowling: 'Fast',
          variation: 'Yorker',
          pace: 95,
          spin: 10,
          control: 90
        },
        bowlingSkill: 19,
        fieldingSkill: 14,
        capped: true,
        form: 90,
        fitness: 88,
        experience: 80
      }),
      createEnhancedPlayer('3', 'MS Dhoni', 'India', 42, 'Wicket-keeper', 12, {
        wicketKeepingSkill: 20,
        wicketKeepingAttributes: { stumping: 95, catching: 90 },
        battingAttributes: { vsSpin: 16, vsSeam: 15 },
        fieldingSkill: 18,
        capped: true,
        form: 75,
        fitness: 85,
        experience: 200
      }),
      createEnhancedPlayer('4', 'Hardik Pandya', 'India', 30, 'All-rounder', 11, {
        battingAttributes: { vsSpin: 14, vsSeam: 16 },
        bowlingAttributes: {
          mainBowling: 'Medium',
          variation: 'Slower',
          pace: 80,
          spin: 20,
          control: 75
        },
        bowlingSkill: 14,
        fieldingSkill: 16,
        capped: true,
        form: 80,
        fitness: 90,
        experience: 100
      }),
      createEnhancedPlayer('5', 'Babar Azam', 'Pakistan', 29, 'Batsman', 10, {
        battingAttributes: { vsSpin: 17, vsSeam: 18 },
        fieldingSkill: 15,
        capped: true,
        form: 88,
        fitness: 92,
        experience: 90
      })
    ];
  }

  private createDefaultTeams(): Team[] {
    const teamNames = [
      'Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bangalore',
      'Kolkata Knight Riders', 'Delhi Capitals', 'Punjab Kings',
      'Rajasthan Royals', 'Sunrisers Hyderabad', 'Gujarat Titans', 'Lucknow Super Giants'
    ];

    return teamNames.map((name, index) => ({
      id: `team_${index + 1}`,
      name,
      manager: undefined,
      budget: 100, // 100 crores
      squad: [],
      draftPicks: []
    }));
  }

  private savePlayersToStorage() {
    localStorage.setItem('ipl_players', JSON.stringify(this.players));
  }

  private saveTeamsToStorage() {
    localStorage.setItem('ipl_teams', JSON.stringify(this.teams));
  }

  private saveUsersToStorage() {
    localStorage.setItem('ipl_users', JSON.stringify(this.users));
  }

  // Player methods
  getAllPlayers(): Player[] {
    return [...this.players];
  }

  getPlayers(): Player[] {
    return this.getAllPlayers();
  }

  getPlayerById(id: string): Player | undefined {
    return this.players.find(p => p.id === id);
  }

  addPlayer(player: Player): void {
    this.players.push(player);
    this.savePlayersToStorage();
  }

  updatePlayer(id: string, updates: Partial<Player>): void {
    const index = this.players.findIndex(p => p.id === id);
    if (index !== -1) {
      this.players[index] = { ...this.players[index], ...updates };
      this.savePlayersToStorage();
    }
  }

  // Team methods
  getAllTeams(): Team[] {
    return [...this.teams];
  }

  getTeams(): Team[] {
    return this.getAllTeams();
  }
  
  // This is the new method to fix the error
  getAvailableTeams(): Team[] {
    return this.teams.filter(t => t.manager === undefined);
  }

  getTeamById(id: string): Team | undefined {
    return this.teams.find(t => t.id === id);
  }

  getTeamByManager(manager: string): Team | undefined {
    return this.teams.find(t => t.manager === manager);
  }

  assignTeamToManager(teamId: string, manager: string): boolean {
    const team = this.teams.find(t => t.id === teamId);
    if (team && !team.manager) {
      team.manager = manager;
      this.saveTeamsToStorage();
      return true;
    }
    return false;
  }

  addPlayerToTeam(teamId: string, playerId: string, price: number): boolean {
    const team = this.teams.find(t => t.id === teamId);
    const player = this.players.find(p => p.id === playerId);
    
    if (team && player && team.budget >= price && !player.isSold) {
      team.budget -= price;
      team.squad.push(player);
      player.currentPrice = price;
      player.isSold = true;
      player.teamId = teamId;
      player.team = teamId; // Legacy compatibility
      this.saveTeamsToStorage();
      this.savePlayersToStorage();
      return true;
    }
    return false;
  }

  // User methods
  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  addUser(user: User): void {
    this.users.push(user);
    this.saveUsersToStorage();
  }

  updateUser(id: string, updates: Partial<User>): void {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      this.saveUsersToStorage();
    }
  }

  // Draft methods
  draftPlayer(teamId: string, playerId: string): boolean {
    const team = this.teams.find(t => t.id === teamId);
    const player = this.players.find(p => p.id === playerId);
    
    if (team && player && !player.isSold && team.draftPicks.length < 5) {
      team.draftPicks.push(player);
      player.currentPrice = 5; // 5 crores for draft
      player.isSold = true;
      player.teamId = teamId;
      player.team = teamId; // Legacy compatibility
      team.budget -= 5;
      this.saveTeamsToStorage();
      this.savePlayersToStorage();
      return true;
    }
    return false;
  }

  // Reset auction status
  resetAuction(): void {
    this.players.forEach(player => {
      player.isSold = false;
      player.currentPrice = 0;
      player.teamId = undefined;
      player.team = undefined;
    });
    
    this.teams.forEach(team => {
      team.squad = [];
      team.draftPicks = [];
      team.budget = 100;
    });
    
    this.savePlayersToStorage();
    this.saveTeamsToStorage();
  }
}
