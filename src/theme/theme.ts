// Shared design tokens keep Home, Cart, and future components visually consistent.
// Colors are calibrated visually to the supplied app screenshots, not official assets.
export const theme = {
  colors: {
    primary: '#FF0099',
    primarySoft: '#FDEBF4',
    purple: '#2E115D',
    background: '#FFFFFF',
    surface: '#F4F4F4',
    search: '#FAFAFA',
    blueSoft: '#EFF7FF',
    text: '#151515',
    textSecondary: '#58616B',
    border: '#D5D9DD',
    white: '#FFFFFF',
  },
  // Lato is a bundled visual approximation of the rounded reference typeface.
  fonts: { regular: 'Lato_400Regular', bold: 'Lato_700Bold', display: 'Lato_900Black_Italic' },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 8, md: 16, lg: 24 },
} as const;
