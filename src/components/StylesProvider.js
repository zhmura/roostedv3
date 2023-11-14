// import React from 'react';
// import PropTypes from 'prop-types';
// import { create } from 'jss';
// import rtl from 'jss-rtl';
// // import { StylesProvider, jssPreset } from '@mui/material/styles';

// const jss = create({ plugins: [...jssPreset().plugins, rtl()] });

// function CustomStylesProvider({ direction, children }) {
//   if (direction !== 'rtl') {
//     return children;
//   }

//   return (
//     <StylesProvider jss={jss}>
//       <div dir="rtl">{children}</div>
//     </StylesProvider>
//   );
// }

// CustomStylesProvider.propTypes = {
//   children: PropTypes.node,
//   direction: PropTypes.string
// };

// export default CustomStylesProvider;
import React from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function CustomStylesProvider({ direction, children }) {
  const theme = createTheme({
    direction: direction,
    // тут можна додати інші налаштування теми, якщо потрібно
  });

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}

CustomStylesProvider.propTypes = {
  children: PropTypes.node,
  direction: PropTypes.oneOf(['ltr', 'rtl'])
};

export default CustomStylesProvider;
