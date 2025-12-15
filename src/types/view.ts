export interface ViewOption {
  id: number;
  content: string;
  votes_count: number;
}

export interface ViewAuthor {
  id: number;
  nickname: string;
}

export interface MyVote {
  option_id: number;
}

export interface View {
  id: number;
  title: string;
  author: ViewAuthor;
  options: ViewOption[];
  total_votes: number;
  my_vote: MyVote | null;
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
export type VoteFilterType = "all" | "voted" | "not_voted";

// 카테고리 관련 타입
export interface Category {
  id: number;
  name: string;
}

export interface CategoriesResponse {
  data: Category[];
}

// 댓글 관련 타입
export interface CommentAuthor {
  id: number;
  nickname: string;
}

export interface Comment {
  id: number;
  content: string;
  author: CommentAuthor;
  created_at: string;
  updated_at: string;
}

export interface CommentsMeta {
  per_page: number;
  has_next: boolean;
  next_cursor: string | null;
}

export interface CommentsResponse {
  data: Comment[];
  meta: CommentsMeta;
}
