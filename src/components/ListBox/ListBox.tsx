import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
  NamedExoticComponent,
  memo,
} from 'react';

import {useToggle} from '../../utilities/use-toggle';
import {elementChildren, isElementOfType} from '../../utilities/components';
import {Key} from '../../types';
import {classNames} from '../../utilities/css';
import {KeypressListener} from '../KeypressListener';
import {scrollable} from '../shared';
import {useUniqueId} from '../../utilities/unique-id';
import {useComboBox} from '../../utilities/combo-box';

import {ListBoxContext} from './utilities/context/list-box';
import {Option, OptionGroup} from './components';
import styles from './ListBox.scss';

export interface ListBoxProps {
  children: ReactNode;
  onSelect(value: string): void;
  allowMultiple?: boolean;
  // TODO: label, labelHidden
}

export const ListBox = memo(function ListBox({
  children,
  onSelect,
  allowMultiple,
}: ListBoxProps) {
  const listBoxClassName = classNames(styles.ListBox);
  const {
    value: keyboardEventsEnabled,
    setTrue: enableKeyboardEvents,
    setFalse: disableKeyboardEvents,
  } = useToggle(false);
  const listId = useUniqueId('ListBox');
  const [navigableItems, setNavigableItems] = useState<string[]>([]);
  const [activeOptionId, setActiveOptionId] = useState<string>();
  const [activeOptionValue, setActiveOptionValue] = useState<string>();
  const scrollableRef = useRef<Element | null>(null);
  const listBoxRef = useRef<HTMLDivElement>(null);
  const totalOptions = useRef<number>(navigableItems.length);
  const comboBox = useComboBox();

  useEffect(() => {
    if (listBoxRef.current) {
      scrollableRef.current = listBoxRef.current.closest(scrollable.selector);
    }
    comboBox &&
      comboBox.setListBoxId &&
      !comboBox.listBoxId &&
      comboBox.setListBoxId(listId);
  }, [comboBox, listId]);

  useEffect(() => {
    const updatedNavigableItems = getNavigableItems([children]);
    setNavigableItems(updatedNavigableItems);
    totalOptions.current = updatedNavigableItems.length;
  }, [children]);

  useEffect(() => {
    // this call will update the textField Aria Active Descendant
    if (
      comboBox &&
      comboBox.setActiveOptionId &&
      activeOptionId &&
      activeOptionId !== comboBox.activeOptionId
    ) {
      comboBox.setActiveOptionId(activeOptionId);
    }
  }, [activeOptionId, comboBox]);

  const onOptionSelect = useCallback(
    (value: string, id?: string) => {
      if (id && id !== activeOptionId) {
        setActiveOptionId(id);
      }
      if (activeOptionValue !== value) {
        setActiveOptionValue(value);
      }

      onSelect(value);

      if (!allowMultiple && comboBox && comboBox.onSingleSelectSelected) {
        comboBox.onSingleSelectSelected();
      }
    },
    [activeOptionId, activeOptionValue, allowMultiple, comboBox, onSelect],
  );

  const listBoxContext = useMemo(
    () => ({
      activeOptionValue,
      scrollable: scrollableRef.current,
      onOptionSelect,
      setActiveOptionId,
    }),
    [activeOptionValue, onOptionSelect],
  );

  /** key interactions */
  const handleDownArrow = (evt: KeyboardEvent) => {
    if (!navigableItems) return;
    evt.preventDefault();
    activeOptionValue == null
      ? setActiveOptionValue(navigableItems[0])
      : handleNextPosition(navigableItems.indexOf(activeOptionValue) + 1);
  };

  const handleUpArrow = (evt: KeyboardEvent) => {
    if (!navigableItems || !totalOptions.current) return;
    evt.preventDefault();
    activeOptionValue == null
      ? setActiveOptionValue(navigableItems[totalOptions.current - 1])
      : handleNextPosition(navigableItems.indexOf(activeOptionValue) - 1);
  };

  const handleNextPosition = (nextPosition: number) => {
    switch (nextPosition) {
      case -1:
        setActiveOptionValue(navigableItems[totalOptions.current - 1]);
        break;
      case totalOptions.current:
        setActiveOptionValue(navigableItems[0]);
        break;
      default:
        setActiveOptionValue(navigableItems[nextPosition]);
    }
  };

  // TODO review handleEnter in multiselect and mutliselect combobox scenario
  const handleEnter = useCallback((evt: KeyboardEvent) => {
    evt.preventDefault();
  }, []);

  const handleSpaceBar = useCallback(
    (evt: KeyboardEvent) => {
      evt.preventDefault();
      if (activeOptionValue && activeOptionId) {
        onOptionSelect(activeOptionValue, activeOptionId);
      }
    },
    [activeOptionId, activeOptionValue, onOptionSelect],
  );

  const listenners =
    keyboardEventsEnabled || comboBox ? (
      <React.Fragment>
        <KeypressListener
          keyEvent="keydown"
          keyCode={Key.DownArrow}
          handler={handleDownArrow}
        />
        <KeypressListener
          keyEvent="keydown"
          keyCode={Key.UpArrow}
          handler={handleUpArrow}
        />
        <KeypressListener
          keyEvent="keydown"
          keyCode={Key.Enter}
          handler={handleEnter}
        />
        <KeypressListener
          keyEvent="keydown"
          keyCode={Key.Space}
          handler={handleSpaceBar}
        />
      </React.Fragment>
    ) : null;

  const handleFocus = () => {
    enableKeyboardEvents();
  };

  const handleBlur = () => {
    if (keyboardEventsEnabled) {
      setActiveOptionId(undefined);
      setActiveOptionValue(undefined);
      disableKeyboardEvents();
    }
  };

  const labelledById = comboBox && comboBox.textFieldLabelId;

  return children ? (
    <div
      ref={listBoxRef}
      tabIndex={-1}
      onFocus={!comboBox ? handleFocus : undefined}
      onBlur={!comboBox ? handleBlur : undefined}
    >
      {listenners}
      <ListBoxContext.Provider value={listBoxContext}>
        <ul
          tabIndex={0}
          role="listbox"
          className={listBoxClassName}
          aria-labelledby={labelledById}
          aria-activedescendant={activeOptionId}
          id={listId}
        >
          {children}
        </ul>
      </ListBoxContext.Provider>
    </div>
  ) : null;
}) as NamedExoticComponent<ListBoxProps> & {
  Option: typeof Option;
  OptionGroup: typeof OptionGroup;
};

function getNavigableItems(children: React.ReactNodeArray): string[] {
  const updateNavigableItems = elementChildren(children).reduce(
    (acc, child: React.ReactElement) => {
      if (
        child &&
        isElementOfType(child, Option) &&
        !child.props.disabled &&
        child.props.value
      ) {
        return [...acc, child.props.value];
        // } else if (child && isElementOfType(child, OptionGroup)) {
      } else if (child) {
        return [...acc, ...getNavigableItems(child.props.children)];
      }
    },
    [] as string[],
  );
  return updateNavigableItems ? updateNavigableItems : [];
}

ListBox.Option = Option;
ListBox.OptionGroup = OptionGroup;
