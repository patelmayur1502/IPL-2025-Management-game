const mongoose = require('mongoose');

const playerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add player name'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Please add base price'],
    },
    country: {
      type: String,
      required: [true, 'Please add country'],
    },
    age: {
      type: Number,
      required: [true, 'Please add age'],
    },
    role: {
      type: String,
      required: [true, 'Please add role'],
      enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'],
    },
    bowlingSkill: {
      type: Number,
      min: 1,
      max: 100,
    },
    fieldingSkill: {
      type: Number,
      min: 1,
      max: 100,
    },
    wicketKeepingSkill: {
      type: Number,
      min: 1,
      max: 100,
    },
    // Batting attributes
    battingAttributes: {
      vsSpin: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
      },
      vsSeam: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
      },
    },
    // Bowling attributes
    bowlingAttributes: {
      mainBowling: {
        type: String,
        enum: ['Fast', 'Medium', 'Spin-Off', 'Spin-Leg', 'Spin-Left', 'None'],
        default: 'None',
      },
      variation: {
        type: String,
        enum: ['Yorker', 'Bouncer', 'Slower', 'Googly', 'Doosra', 'Carrom', 'None'],
        default: 'None',
      },
      pace: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      spin: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      control: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    // Fielding attributes
    fieldingAttributes: {
      catching: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
      },
      throwing: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
      },
      groundFielding: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
      },
    },
    // Wicket-keeping attributes
    wicketKeepingAttributes: {
      stumping: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      catching: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    // Player traits
    traits: {
      battingPosition: {
        type: String,
        enum: ['Top Order', 'Middle Order', 'Lower Order', 'None'],
        default: 'None',
      },
      bowlingSpecialty: {
        type: String,
        enum: ['Power Play Specialist', 'Middle Overs Specialist', 'Death Specialist', 'None'],
        default: 'None',
      },
    },
    battingStyle: {
      type: String,
      enum: ['RHB', 'LHB'],
    },
    bowlingStyle: {
      type: String,
    },
    capped: {
      type: Boolean,
      default: false,
    },
    skillPoints: {
      type: Number,
      default: 0,
    },
    // Player form and fitness
    form: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    fitness: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    // Player experience
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Team assignment
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    // Player statistics
    statistics: {
      matches: {
        type: Number,
        default: 0,
      },
      // Batting stats
      runs: {
        type: Number,
        default: 0,
      },
      ballsFaced: {
        type: Number,
        default: 0,
      },
      highestScore: {
        type: Number,
        default: 0,
      },
      fifties: {
        type: Number,
        default: 0,
      },
      hundreds: {
        type: Number,
        default: 0,
      },
      fours: {
        type: Number,
        default: 0,
      },
      sixes: {
        type: Number,
        default: 0,
      },
      // Bowling stats
      wickets: {
        type: Number,
        default: 0,
      },
      ballsBowled: {
        type: Number,
        default: 0,
      },
      runsConceded: {
        type: Number,
        default: 0,
      },
      bestBowling: {
        wickets: {
          type: Number,
          default: 0,
        },
        runs: {
          type: Number,
          default: 0,
        },
      },
      // Fielding stats
      catches: {
        type: Number,
        default: 0,
      },
      runOuts: {
        type: Number,
        default: 0,
      },
      stumpings: {
        type: Number,
        default: 0,
      },
    },
    // Current price in auction
    currentPrice: {
      type: Number,
      default: 0,
    },
    // Is player sold in auction
    isSold: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate player's star rating during a match
playerSchema.methods.calculateStarRating = function(matchConditions, opposingPlayer = null) {
  let rating = 0;

  // Add skill points to base rating
  rating += this.skillPoints * 0.5;
  
  // Base attributes contribution
  if (this.role === 'Batsman' || this.role === 'All-Rounder' || this.role === 'Wicket-Keeper') {
    // For batsmen, consider batting attributes
    const spinContribution = this.battingAttributes.vsSpin * 0.2;
    const seamContribution = this.battingAttributes.vsSeam * 0.2;
    rating += this.fieldingSkill * 0.1;
    if (this.role === 'Wicket-Keeper') {
      rating += this.wicketKeepingSkill * 0.1;
    }
    
    // Adjust based on pitch type
    let pitchMultiplier = 1;
    if (matchConditions.pitchType === 'dusty') {
      // Dusty pitch favors spin
      rating += spinContribution * 1.2 + seamContribution * 0.8;
    } else if (matchConditions.pitchType === 'green') {
      // Green pitch favors seam
      rating += spinContribution * 0.8 + seamContribution * 1.2;
    } else {
      // Standard or flat pitch
      rating += spinContribution + seamContribution;
    }
  }
  
  if (this.role === 'Bowler' || this.role === 'All-Rounder') {
    // For bowlers, consider bowling attributes
    let bowlingRating = 0;
    
    if (this.bowlingAttributes.mainBowling.includes('Spin')) {
      bowlingRating = this.bowlingAttributes.spin * 0.3 + this.bowlingAttributes.control * 0.2;
      rating += this.bowlingSkill * 0.1;
      
      // Adjust based on pitch type
      if (matchConditions.pitchType === 'dusty') {
        bowlingRating *= 1.2; // Spin bowlers do better on dusty pitches
      } else if (matchConditions.pitchType === 'green') {
        bowlingRating *= 0.9; // Spin bowlers do worse on green pitches
      }
    } else {
      bowlingRating = this.bowlingAttributes.pace * 0.3 + this.bowlingAttributes.control * 0.2;
      rating += this.bowlingSkill * 0.1;
      
      // Adjust based on pitch type
      if (matchConditions.pitchType === 'green') {
        bowlingRating *= 1.2; // Pace bowlers do better on green pitches
      } else if (matchConditions.pitchType === 'dusty') {
        bowlingRating *= 0.9; // Pace bowlers do worse on dusty pitches
      }
    }
    
    rating += bowlingRating;
  }
  
  // Add contribution from form, fitness and experience
  rating += (this.form / 100) * 10; // Up to 10 points from form
  rating += (this.fitness / 100) * 5; // Up to 5 points from fitness
  rating += Math.min(this.experience / 50, 1) * 10; // Up to 10 points from experience, capped at 50 matches
  
  // Trait bonuses
  if (opposingPlayer) {
    // Apply trait bonuses based on match situation
    // This would be expanded based on actual match state (batting position, over number, etc.)
  }
  
  // Weather conditions effect
  if (matchConditions.weather === 'overcast' && this.role.includes('Bowler') && 
      !this.bowlingAttributes.mainBowling.includes('Spin')) {
    rating += 3; // Pace bowlers get advantage in overcast conditions
  }
  
  // Cap the rating at 100
  return Math.min(Math.round(rating), 100);
};

// Method to get star color based on rating
playerSchema.methods.getStarColor = function(rating) {
  if (rating <= 20) return 'yellow';
  if (rating <= 40) return 'red';
  if (rating <= 60) return 'orange';
  if (rating <= 80) return 'blue';
  if (rating <= 100) return 'green';
  return 'purple';
};

// Method to get number of stars to display
playerSchema.methods.getStarCount = function(rating) {
  // For ratings 1-20, return the rating / 2
  // For ratings 21-100, return the rating % 20 (or 20 if rating % 20 === 0) / 2
  return rating <= 20 ? Math.ceil(rating / 2) : Math.ceil((rating % 20 === 0 ? 20 : rating % 20) / 2);
};

module.exports = mongoose.model('Player', playerSchema);