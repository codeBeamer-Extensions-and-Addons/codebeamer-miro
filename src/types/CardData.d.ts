export interface CardData {
  style?: any; 
  x?: any; 
  y?: any; 
  type?: string; 
  title?: string; 
  description?: any; 
  card?: {
    logo: { 
      iconUrl: string 
    };
    customFields: ({
      mainColor: string // light blue
      fontColor: string // white
      value: string
    } | { value: string })[]
  }; 
  capabilities?: {
    editable: boolean;
  }; 
  metadata?: any;
}