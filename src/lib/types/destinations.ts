export interface IDestination {
  _id: string;
  /** The backend stores this field as `destinationName`. */
  destinationName: string;
  country: string;
  category: string;
  price: string | number;
  duration: string;
  departureDate: string;
  imageUrl: string;
  description: string;
  featured?: boolean;
};
