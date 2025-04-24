export interface GoogleDistanceMatrixElement {
  status: string;
  duration: {
    text: string;
    value: number;
  };
  distance: {
    text: string;
    value: number;
  };
}

export interface GoogleDistanceMatrixRow {
  elements: GoogleDistanceMatrixElement[];
}

export interface GoogleDistanceMatrixResponse {
  rows: GoogleDistanceMatrixRow[];
}
