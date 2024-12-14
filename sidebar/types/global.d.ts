import { Surreal } from 'surrealdb';

declare global {
  interface Window {
    db: Surreal;
  }
}
