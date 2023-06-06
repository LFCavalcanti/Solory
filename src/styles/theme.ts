import { extendTheme } from '@chakra-ui/react';
import { ButtonStyles as Button } from './components/buttonStyles';
import { customFonts as fonts } from './customFonts';
import { customColors as colors } from './customColors';

const customTheme = {
  fonts,
  colors,
  components: {
    Button,
  },
};

const soloryTheme = extendTheme(customTheme);

export default soloryTheme;
