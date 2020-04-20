import React, {ReactNode, useMemo, memo} from 'react';

import {useUniqueId} from '../../../../utilities/unique-id';
import {OptionGroupContext} from '../../utilities/context/option-group';

import styles from './OptionGroup.scss';

export interface OptionGroupProps {
  label: string;
  children: ReactNode;
}

export const OptionGroup = memo(function OptionGroup({
  label,
  children,
}: OptionGroupProps) {
  const id = useUniqueId('OptionGroup');
  const contextValue = useMemo(
    () => ({
      optionGroupId: id,
    }),
    [id],
  );

  return (
    <React.Fragment>
      <OptionGroupContext.Provider value={contextValue}>
        <li
          className={styles.Label}
          id={id}
          role="group"
          // aria-selected={false}
          aria-label={label}
        >
          {label}
        </li>
        {children}
      </OptionGroupContext.Provider>
    </React.Fragment>
  );
});
