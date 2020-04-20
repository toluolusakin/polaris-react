import React, {useCallback, useState} from 'react';

import {Page, ComboBox, ListBox, Modal} from '../src';

import deselectedOptions from './test/100.json';

export function Playground() {
  const [inputValue, setInputValue] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [options, setOptions] = useState(deselectedOptions);
  const [multiSelect, setMultiSelect] = useState(false);

  const handleSelection = useCallback(
    (value: string) => {
      if (selectedItems.includes(value)) {
        setSelectedItems(selectedItems.filter((item) => item !== value));
      } else if (multiSelect) {
        setSelectedItems([...selectedItems, value]);
      } else {
        setSelectedItems([value]);
      }
      const {label} = options.filter((option) => option.value === value)[0];
      setInputValue(label);
    },
    [multiSelect, options, selectedItems],
  );

  const updateText = useCallback((value) => {
    setInputValue(value);

    if (value === '') {
      setOptions(deselectedOptions);
      return;
    }

    const filterRegex = new RegExp(value, 'i');
    const resultOptions = deselectedOptions.filter((option) =>
      option.label.match(filterRegex),
    );
    setOptions(resultOptions);
  }, []);

  const optionsMarkup =
    options.length > 0
      ? options.map((option, index) => {
          const {label, value} = option;

          return (
            <ListBox.Option
              key={`${value}_${index}`}
              value={value}
              label={label}
              selected={selectedItems.includes(value)}
            />
          );
        })
      : null;

  return (
    <Page title="Playground">
      {/* <Modal
        title="Reach more shoppers with Instagram product tags"
        open
        onClose={() => null}
      >
        <Modal.Section> */}
      <ComboBox
        activator={
          <ComboBox.TextField
            onChange={updateText}
            label="Tags"
            value={inputValue}
            typeAheadText={options[0] && options[0].label}
          />
        }
      >
        <ListBox onSelect={handleSelection}>
          <ListBox.OptionGroup label="My Section Title">
            {optionsMarkup}
          </ListBox.OptionGroup>
        </ListBox>
      </ComboBox>
      {/* </Modal.Section>
      </Modal> */}
    </Page>
  );
}

// /////////////

// import React, {useState} from 'react';

// import {Page, ListBox, Scrollable} from '../src';

// import items from './test/1000.json';

// export function Playground() {
//   const [selectedItems, setSelectedItems] = useState<string[]>([]);
//   const [multiSelect, setMultiSelect] = useState(false);
//   // const items = [
//   //   {value: 'item 1'},
//   //   {value: 'item 2'},
//   //   {value: 'item 3'},
//   //   {value: 'item 4'},
//   //   {value: 'item 5'},
//   // ];

//   // const items2 = [
//   //   {value: 'item 6'},
//   //   {value: 'item 7'},
//   //   {value: 'item 8'},
//   //   {value: 'item 9'},
//   //   {value: 'item 10'},
//   // ];

//   const handleSelect = (value: string) => {
//     // for single Select

//     if (selectedItems.includes(value)) {
//       setSelectedItems(selectedItems.filter((item) => item !== value));
//     } else if (multiSelect) {
//       setSelectedItems([...selectedItems, value]);
//     } else {
//       setSelectedItems([value]);
//     }
//     // setSelected(value);
//     // console.log(value);
//   };

//   return (
//     <Page title="Playground">
//       <div style={{height: '200px'}}>
//         <Scrollable style={{height: '200px'}}>
//           <ListBox onSelect={handleSelect}>
//             {items.map(({value}) => (
//               <ListBox.Option
//                 key={value}
//                 selected={selectedItems.includes(value)}
//                 label={value}
//                 value={value}
//               />
//             ))}
//             {/* <ListBox.OptionGroup label="Label for group">
//               {items2.map(({value}) => (
//                 <ListBox.Option
//                   selected={selectedItems.includes(value)}
//                   key={value}
//                   label={value}
//                   value={value}
//                 />
//               ))}
//             </ListBox.OptionGroup> */}
//           </ListBox>
//         </Scrollable>
//       </div>
//     </Page>
//   );
// }
