import React from 'react';

export interface OptionGroupContextType {
  optionGroupId: string | undefined;
}

export const OptionGroupContext = React.createContext<OptionGroupContextType>({
  optionGroupId: undefined,
});
