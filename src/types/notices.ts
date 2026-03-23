export type Notice = {
  id: string;
  type: string;
  number: string;
  category: string;
  title: string;
  department: string;
  date: string;
  link: string;
};

export type NoticePage = {
  content: Notice[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};

export type NoticeQuery = {
  page?: number;
  size?: number;
  type?: string;
  search?: string;
  sort?: string;
  globalIds?: string;
  personalIds?: string;
  match?: string;
};
