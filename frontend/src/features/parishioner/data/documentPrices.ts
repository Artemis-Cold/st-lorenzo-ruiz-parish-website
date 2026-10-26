import type { DocumentType } from "../types/document";

export interface DocumentPrice {
  type: DocumentType;
  price: number;
}

export const DOCUMENT_PRICES: DocumentPrice[] = [
  { type: "First Communion Certificate", price: 100 },
  { type: "Death Permit", price: 0 },
  { type: "Baptism Permit", price: 100 },
  { type: "Confirmation Permit", price: 100 },
  {
    type: "Baptismal Certificate",
    price: 100,
  },
  {
    type: "Confirmation Certificate",
    price: 100,
  },
  {
    type: "Funeral Certificate",
    price: 100,
  },
  {
    type: "Marriage Certificate",
    price: 100,
  },
];

export const getDocumentPrice = (type: DocumentType): number => {
  return DOCUMENT_PRICES.find((document) => document.type === type)?.price ?? 0;
};
