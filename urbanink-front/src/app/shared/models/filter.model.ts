export interface ProductFilter {
  search: string;
  category: string | null;
  sort: 'newest' | 'price_asc' | 'price_desc';
  onlyAvailable: boolean;
}