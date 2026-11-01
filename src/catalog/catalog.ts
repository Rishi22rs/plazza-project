import catalogData from './catalog.json';

/** A catalog entry, using the field names and rupee prices from the brief. */
export type Medicine = {
  readonly id: string;
  readonly name: string;
  readonly salt: string;
  readonly price: number;
  readonly maxQty: number;
  readonly rx: boolean;
  /** Temporary medicine illustration URL; replace with real product photography later. */
  readonly imageUrl: string;
};

// Import the bundled JSON once. Search and cart features will share this source
// rather than duplicating prices or product details inside screen components.
// Readonly types prevent accidental edits through this exported catalog API.
export const catalog: readonly Medicine[] = catalogData;
