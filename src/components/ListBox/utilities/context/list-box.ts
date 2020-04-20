import React from 'react';

export interface ListBoxContextType {
  activeOptionValue?: string;
  setActiveOptionValue?(value: string): void; // used for navigable values
  setActiveOptionId?(id: string): void; // used for activeDescendant
  scrollable?: Element | null;
  onOptionSelect?(value: string, id?: string): void;
}

export const ListBoxContext = React.createContext<ListBoxContextType>({});
