import React, {useMemo} from 'react';

import {useComboBox} from '../../../../utilities/combo-box';
import {useUniqueId} from '../../../../utilities/unique-id';
import {labelID} from '../../../Labelled';
import {
  TextField as ComboBoxTextField,
  TextFieldProps,
} from '../../../TextField';

export function TextField({
  typeAheadText,
  value,
  id: idProp,
  ...rest
}: TextFieldProps) {
  const comboBox = useComboBox();
  const id = useUniqueId('ComboBoxTextField', idProp);
  const clearButton = Boolean(value);
  const labelId = useMemo(() => labelID(id), [id]);

  if (!comboBox) {
    throw new Error('You need a combobox to use this TextField');
  }

  const {
    activeOptionId,
    listBoxId,
    setTypeAheadText,
    textFieldId,
    setTextFieldId,
    textFieldLabelId,
    setTextFieldLabelId,
  } = comboBox;

  if (typeAheadText) {
    setTypeAheadText && setTypeAheadText(typeAheadText);
  }
  if (!textFieldId && setTextFieldId) setTextFieldId(id);
  if (!textFieldLabelId && setTextFieldLabelId) setTextFieldLabelId(labelId);

  return (
    <ComboBoxTextField
      {...rest}
      value={value}
      clearButton={clearButton}
      typeAheadText={typeAheadText}
      autoComplete={false}
      ariaAutocomplete={typeAheadText ? 'both' : 'list'}
      ariaActiveDescendant={activeOptionId}
      ariaControls={listBoxId}
    />
  );
}
