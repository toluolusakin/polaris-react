import React, {useRef, useEffect, useCallback, memo} from 'react';
import {TickMinor} from '@shopify/polaris-icons';

// we really want to keep combobox out of this for now because it really slows this down
// import {useComboBox} from '../../../../utilities/combo-box';
import {classNames} from '../../../../utilities/css';
import {useUniqueId} from '../../../../utilities/unique-id';
import {Icon} from '../../../Icon';
import {useListBox} from '../../utilities/hooks/useListBox';
import {useOptionGroup} from '../../utilities/hooks/useOptionGroup';

import styles from './Option.scss';

export interface OptionProps {
  value: string;
  label: string;
  suggest?: boolean;
  children?: React.ReactNode | string;
  selected?: boolean;
  disabled?: boolean;
}
// suggest,
export const Option = memo(function Option({
  value,
  children,
  selected,
  label,
}: OptionProps) {
  const {
    activeOptionValue,
    scrollable,
    onOptionSelect,
    setActiveOptionId,
  } = useListBox();

  const {optionGroupId} = useOptionGroup();
  const listItemRef = useRef<HTMLLIElement>(null);
  const id = useUniqueId('ListBoxOption');

  const active = activeOptionValue === value;

  if (active && activeOptionValue !== id) {
    setActiveOptionId && setActiveOptionId(id);
  }
  // setSuggestion && suggest && text && setSuggestion(text);

  const optionClassName = classNames(
    styles.Option,
    selected && styles.selected,
    active && styles.active,
  );

  useEffect(() => {
    if (active && scrollable && listItemRef.current) {
      const elementTop = listItemRef.current.offsetTop;
      const elementBottom = elementTop + listItemRef.current.clientHeight;
      const viewportTop = (scrollable as HTMLElement).scrollTop;
      const viewportBottom = viewportTop + scrollable.clientHeight;

      let direction: boolean | undefined;

      if (elementBottom > viewportBottom) {
        direction = false;
      } else if (elementTop < viewportTop) {
        direction = true;
      }

      typeof direction === 'boolean' &&
        requestAnimationFrame(() => {
          listItemRef.current && listItemRef.current.scrollIntoView(direction);
        });
    }
  }, [active, scrollable]);

  const handleItemClick = useCallback(() => {
    onOptionSelect && onOptionSelect(value, id);
  }, [id, onOptionSelect, value]);

  const selectedIconMarkup = selected ? (
    <div className={styles.Checkmark}>
      <Icon color="indigo" source={TickMinor} />
    </div>
  ) : null;

  return (
    <li
      className={optionClassName}
      id={id}
      ref={listItemRef}
      tabIndex={-1}
      onClick={handleItemClick}
      aria-label={label}
      role="option"
      aria-selected={selected || active}
      aria-describedby={optionGroupId}
    >
      {/* {enterKeyListenner} */}
      <div className={styles.Content}>{children || label}</div>
      {selectedIconMarkup}
    </li>
  );
});
