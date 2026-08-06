import type { DocumentType } from "../types/document";

export interface DocumentPrice {
  type: DocumentType;
  price: number;
}

export const DOCUMENT_PRICES: DocumentPrice[] = [
  {
    type: "Baptismal Certificate",
    price: 100,
  },
  {
    type: "Confirmation Certificate",
    price: 100,
  },
  {
    type: "Death Certificate",
    price: 100,
  },
  {
    type: "Marriage Certificate",
    price: 100,
  },
  {
    type: "Publication of Marriage Bans",
    price: 500,
  },
  {
    type: "Request of Permission",
    price: 100,
  },
];

export const getDocumentPrice = (
  type: DocumentType,
): number => {
  return (
    DOCUMENT_PRICES.find(
      (document) => document.type === type,
    )?.price ?? 0
  );
};