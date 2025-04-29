// Colors
export const colors = {
  primary: '#007bff',
  primaryHover: '#0056b3',
  danger: '#dc3545',
  dangerHover: '#c82333',
  background: '#f5f5f5',
  white: '#ffffff',
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#495057'
  },
  border: '#dee2e6'
};

// Spacing
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px'
};

// Typography
export const typography = {
  fontFamily: 'Arial, sans-serif',
  fontSize: {
    small: 'clamp(0.875rem, 3vw, 1rem)',
    medium: 'clamp(1rem, 3vw, 1.2rem)',
    large: 'clamp(1.2rem, 4vw, 1.5rem)'
  }
};

// Shadows
export const shadows = {
  card: '0 4px 6px rgba(0, 0, 0, 0.1)'
};

// Border Radius
export const borderRadius = {
  small: '3px',
  medium: '5px',
  large: '10px'
};

// Common Styles
export const commonStyles = {
  card: {
    background: colors.white,
    padding: 'clamp(1rem, 4vw, 2rem)',
    borderRadius: borderRadius.large,
    boxShadow: shadows.card
  },
  button: {
    primary: {
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      padding: '12px 24px',
      borderRadius: borderRadius.medium,
      fontSize: typography.fontSize.medium,
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    danger: {
      backgroundColor: colors.danger,
      color: colors.white,
      border: 'none',
      padding: 'clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px)',
      borderRadius: borderRadius.medium,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: typography.fontSize.small,
      whiteSpace: 'nowrap',
      touchAction: 'manipulation'
    }
  },
  input: {
    base: {
      width: '100%',
      border: 'none',
      background: 'transparent',
      padding: spacing.xs,
      borderRadius: borderRadius.small,
      fontSize: typography.fontSize.small,
      touchAction: 'manipulation'
    }
  },
  table: {
    cell: {
      border: `1px solid ${colors.border}`,
      padding: 'clamp(8px, 2vw, 12px)',
      fontSize: typography.fontSize.small
    },
    header: {
      background: '#f8f9fa',
      color: colors.text.light
    }
  }
}; 