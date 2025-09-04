import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { Player, getStarRating } from '@/lib/database';

interface PlayerCardProps {
  player: Player;
  showDetailedStats?: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
}

export default function PlayerCard({ player, showDetailedStats = false, onSelect, isSelected = false }: PlayerCardProps) {
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
        <span className="text-xs ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{player.name}</CardTitle>
          <Badge variant={player.capped ? 'default' : 'secondary'}>
            {player.capped ? 'Capped' : 'Uncapped'}
          </Badge>
        </div>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>{player.country}</span>
          <span>•</span>
          <span>{player.age} years</span>
          <span>•</span>
          <span>{player.position}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Base Price:</span>
          <span className="font-bold">₹{player.basePrice}L</span>
        </div>
        
        {player.currentPrice && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Current Price:</span>
            <span className="font-bold text-green-600">₹{player.currentPrice}L</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Skill Points:</span>
          <span className="font-bold">{player.skillPoints}</span>
        </div>

        <div className="space-y-2">
          <Badge variant="outline" className="text-xs">
            {player.trait}
          </Badge>
          
          {showDetailedStats && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>vs Spin:</span>
                  <StarRating rating={player.battingSkillVsSpin} />
                </div>
                <div className="flex justify-between">
                  <span>vs Seam:</span>
                  <StarRating rating={player.battingSkillVsSeam} />
                </div>
                <div className="flex justify-between">
                  <span>Bowling:</span>
                  <StarRating rating={player.bowlingSkill} />
                </div>
                <div className="flex justify-between">
                  <span>Fielding:</span>
                  <StarRating rating={player.fieldingSkill} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Keeping:</span>
                  <StarRating rating={player.wicketKeepingSkill} />
                </div>
                <div className="flex justify-between">
                  <span>Fitness:</span>
                  <StarRating rating={player.fitness} />
                </div>
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <StarRating rating={player.experience} />
                </div>
                <div className="flex justify-between">
                  <span>Form:</span>
                  <StarRating rating={player.form} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <div>{player.battingSubCategory}</div>
          <div>{player.bowlingSubCategory}</div>
        </div>
      </CardContent>
    </Card>
  );
}