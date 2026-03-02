// Chat types for simplified smart assistant

export interface SimilarTicket {
  id: string;
  description: string;
  handleDetail: string;
  score: number;
}

export interface AskResponse {
  success: boolean;
  message: string;
  similarTickets: SimilarTicket[];
}
