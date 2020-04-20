import {useContext} from 'react';

import {OptionGroupContext} from '../context/option-group';

export function useOptionGroup() {
  const optionGroup = useContext(OptionGroupContext);
  return optionGroup;
}
