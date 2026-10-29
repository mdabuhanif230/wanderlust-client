export interface IBooking {
  _id: string;
  username: string;
  email: string;
  image: string;
  /** The backend stores the destination title as `destinationName`. */
  destinationName: string;
  country: string;
  category: string;
  price: string | number;
  duration: string;
  departureDate: string;
  imageUrl: string;
  description: string;
  bookingDate: string;
}
