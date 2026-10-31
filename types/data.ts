export interface Report {
  id: string;
  title: string;
  type: string;
  period: string;
  format: string;
  generatedDate: string;
  size: string;
  [key: string]: any;
}

export interface Data {
  user?: any;
  meta?: Meta;
  reports?: Report[];
}

export interface Meta {
  total_page: number;
  total_item: number;
  current_page: number;
  per_page: number;
  total_pages?: number;
}
