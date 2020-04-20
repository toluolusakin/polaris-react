import React, {useState, ReactNode} from 'react';

import {useMediaQuery} from '../../utilities/media-query';
import {ComboBoxContext, ComboBoxContextType} from '../../utilities/combo-box';
import {scrollable} from '../shared';
import type {TextFieldProps} from '../TextField';
import {Popover} from '../Popover';
import {EventListener} from '../EventListener';

import {TextField, InlinePopover} from './components';

export interface ComboBoxProps {
  id?: string;
  children?: ReactNode;
  activator: React.ReactElement<TextFieldProps>;
  allowMultiple?: boolean;
  // onOptionSelected(id: string): void;
}

export function ComboBox({children, activator}: ComboBoxProps) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [activeOptionId, setActiveOptionId] = useState<string>();
  const [typeAheadText, setTypeAheadText] = useState<string>();
  const [textFieldId, setTextFieldId] = useState<string>();
  const [textFieldLabelId, setTextFieldLabelId] = useState<string>();
  const [listBoxId, setListBoxId] = useState<string>();
  const {isNavigationCollapsed} = useMediaQuery();

  const handleSingleSelectSelected = () => {
    // TODO need to prevent this focus from retriggering the Popover. Settimeout doens't work on key press
    focusInput();
    setPopoverActive(false);
  };

  const contextValue: ComboBoxContextType = {
    activeOptionId,
    setActiveOptionId,
    typeAheadText,
    setTypeAheadText,
    textFieldId,
    setTextFieldId,
    textFieldLabelId,
    setTextFieldLabelId,
    listBoxId,
    setListBoxId,
    onSingleSelectSelected: handleSingleSelectSelected,
  };

  const handleFocus = () => {
    if (!popoverActive && children) {
      setPopoverActive(true);
    } else if (popoverActive && !children) {
      setPopoverActive(false);
    }
  };

  const handleKeyUp = () => {
    handleFocus();
  };

  const handleClose = () => {
    setPopoverActive(false);
  };

  const textfieldMarkup = (
    <div
      aria-haspopup="listbox"
      aria-owns={listBoxId}
      // eslint complaining about aria-controls, which is 1.1 in the textbox
      // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
      role="combobox"
      aria-expanded={popoverActive}
      onFocus={handleFocus}
      onKeyUp={handleKeyUp}
      tabIndex={-1}
    >
      {activator}
    </div>
  );

  const focusInput = () => {
    const input = textFieldId && document.getElementById(textFieldId);
    if (input) input.focus();
  };

  // Can't get arround loosing the field focus when someone scrolls with the mouse
  const handleStopScroll = ({target}: MouseEvent) => {
    if ((target as HTMLElement).matches(scrollable.selector)) {
      focusInput();
    }
  };

  const popover = isNavigationCollapsed ? (
    <InlinePopover
      active={popoverActive}
      activator={textfieldMarkup}
      onClose={handleClose}
    >
      {children}
    </InlinePopover>
  ) : (
    <Popover
      active={popoverActive}
      onClose={handleClose}
      activator={textfieldMarkup}
      preventAutofocus
      fullWidth
      preferInputActivator={false}
    >
      {children}
    </Popover>
  );

  return (
    <ComboBoxContext.Provider value={contextValue}>
      {popover}
      <EventListener event="mouseup" handler={handleStopScroll} />
    </ComboBoxContext.Provider>
  );
}

ComboBox.TextField = TextField;
