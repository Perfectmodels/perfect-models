import './types';

declare module './types' {
  interface Article {
    id?: string;
    featuredImage?: string;
    publishDate?: string;
  }
}
