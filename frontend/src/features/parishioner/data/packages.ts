export interface PackageItem {
  id: number;
  name: string;
  price: number;
  included: boolean;
}

export const packageItems: PackageItem[] = [
  {
    id: 1,
    name: "Mass Offering",
    price: 2000,
    included: true,
  },
  {
    id: 2,
    name: "Rite Fee",
    price: 1000,
    included: true,
  },
  {
    id: 3,
    name: "Seminars Fee",
    price: 1000,
    included: true,
  },
  {
    id: 4,
    name: "Electricity",
    price: 1000,
    included: true,
  },
  {
    id: 5,
    name: "Solidarity Donation",
    price: 3000,
    included: true,
  },
  {
    id: 6,
    name: "Handbook",
    price: 700,
    included: true,
  },
];

export const addOns: PackageItem[] = [
  {
    id: 7,
    name: "Red Carpet",
    price: 1000,
    included: false,
  },
  {
    id: 8,
    name: "Flower Stand",
    price: 500,
    included: false,
  },
  {
    id: 9,
    name: "Videographer & Photographer's Entrance Fee",
    price: 2200,
    included: false,
  },
  {
    id: 10,
    name: "Candle",
    price: 1500,
    included: false,
  },
  {
    id: 11,
    name: "Bible",
    price: 600,
    included: false,
  },
];
