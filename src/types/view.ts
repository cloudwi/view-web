export interface ViewOption {
  id: number;
  content: string;
  votes_count: number;
}

export interface ViewAuthor {
  id: number;
  nickname: string;
}

export interface View {
  id: number;
  title: string;
  author: ViewAuthor;
  options: ViewOption[];
  total_votes: number;
  my_vote: number | null;
  created_at: string;
  updated_at: string;
  edited: boolean;
  comments_count: number;
}

export interface ViewsMeta {
  per_page: number;
  has_next: boolean;
  next_cursor: string | null;
}

export interface ViewsResponse {
  data: View[];
  meta: ViewsMeta;
}

export type SortType = "latest" | "popular";
