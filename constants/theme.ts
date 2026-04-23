/**
 * Theme configuration file
 * Based on Week 4 concepts of consistent UI design and theming
 * Defines colours for light and dark mode and font settings across platforms
 */

import { Platform } from 'react-native';

// Base tint colours used for highlights and selected states
// Week 4: consistent accent colour improves usability and recognition
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// Colour system for light and dark themes
// Week 4: separating themes improves scalability and maintainability
export const Colors = {
  light: {
    text: '#11181C', // Primary text colour for readability
    background: '#fff', // Main background for screens
    tint: tintColorLight, // Accent colour used for highlights
    icon: '#687076', // Default icon colour
    tabIconDefault: '#687076', // Unselected tab icon
    tabIconSelected: tintColorLight, // Selected tab icon
  },
  dark: {
    text: '#ECEDEE', // Light text for dark backgrounds
    background: '#151718', // Dark background
    tint: tintColorDark, // Accent colour in dark mode
    icon: '#9BA1A6', // Default icon colour in dark mode
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Font configuration depending on platform
// Week 4: platform-specific styling ensures better UX consistency
export const Fonts = Platform.select({
  ios: {
    // System fonts provided by iOS
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    // Fallback fonts for Android and other platforms
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    // Web-safe font stacks
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});