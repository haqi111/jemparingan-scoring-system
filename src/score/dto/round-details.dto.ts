export class ParticipantScoreDto {
  name: string;
  scores: number[];
  totalScore: number;
}

export class RoundDetailsDto {
  roundId: number;
  roundName: string;
  participants: ParticipantScoreDto[];
}
