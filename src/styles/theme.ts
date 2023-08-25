import { extendTheme } from '@chakra-ui/react';
import { ButtonStyles as Button } from './components/buttonStyles';
import { TableStyles as Table } from './components/tableStyles';
import { CheckboxStyles as Checkbox } from './components/checkboxStyles';
import { customFonts as fonts } from './customFonts';
import { customColors as colors } from './customColors';

const customTheme = {
  fonts,
  colors,
  components: {
    Button,
    Table,
    Checkbox,
  },
};

const soloryTheme = extendTheme(customTheme);

export default soloryTheme;
