import React from 'react';

export interface ComboBoxContextType {
  // set by list
  setActiveOptionId?(id: string): void;
  // consumed by aria-activedescendant on combobox.textfield (also on list context when not in combobox)
  activeOptionId?: string;
  // set by list
  setListBoxId?(id: string): void;
  // consumed by div.aria-owns and textField.aria-control
  listBoxId?: string;
  // set by the combobox.textfield prop
  setTypeAheadText?(value: string): void;
  // consumed by the List Box to activate the right options
  typeAheadText?: string;
  // set by combobox.textfield
  setTextFieldId?(id: string): void;
  // consumed by combobox to set focus (this could maybe be a ref)
  textFieldId?: string;
  // set by the combobox.textfield
  setTextFieldLabelId?(id: string): void;
  // consumed by listBox aria-labelledby
  textFieldLabelId?: string;
  // this called by the listBox click simply to handle refocusing of the field and close on popover
  onSingleSelectSelected?(): void;
}

export const ComboBoxContext = React.createContext<
  ComboBoxContextType | undefined
>(undefined);
