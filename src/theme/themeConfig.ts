import { appFont } from '@/pages/_app'
import { colors } from '@/styles'
import type { ThemeConfig } from 'antd'

const theme: ThemeConfig = {
  token: {
    fontFamily: appFont.style.fontFamily,
    fontSize: 15,
    colorPrimary: colors.primary,
    fontSizeHeading1: 49,
    lineHeightHeading2: 1.45,
    fontSizeHeading2: 32,
    fontSizeHeading3: 24,
    fontSizeHeading4: 18,
    fontSizeHeading5: 16,
    colorText: '#111111',
    colorErrorBorder: colors.danger,
    fontWeightStrong: 700,
    borderRadiusLG: 24,
    borderRadius: 16,
    boxShadow: 'none',
    boxShadowSecondary: 'none',
    boxShadowTertiary: 'none',
    controlHeightLG: 55,
    paddingXXS: 12,
  },
  components: {
    Button: {
      fontSize: 14,

      boxShadow: 'none',
      primaryShadow: 'none',
      dangerShadow: 'none',
      defaultShadow: 'none',

      dangerColor: colors.danger,

      borderRadius: 8,
      controlHeight: 38,
      borderRadiusLG: 16,
      fontSizeLG: 16,

      controlHeightLG: 56,
    },
    DatePicker: {
      paddingInline: 16,
      fontSize: 16,
      fontSizeLG: 16,
      borderRadius: 16,
      borderRadiusLG: 16,
      colorBgContainer: colors.secondary_light,
      colorTextPlaceholder: colors.secondary,
      controlHeightLG: 56,
      boxShadowSecondary: '0px 16px 24px 0px rgba(119, 126, 144, 0.12)',
      colorBorder: 'transparent',
      cellHeight: 46,
      cellWidth: 46,
      cellHoverWithRangeBg: colors.primary_light,
      borderRadiusSM: 1000,
      borderRadiusXS: 1000,
      cellActiveWithRangeBg: colors.secondary_light,
    },
    Form: {
      labelColor: colors.secondary,
      labelFontSize: 14,
    },
    Input: {
      paddingInlineLG: 16,

      colorText: '#111111',
      colorTextPlaceholder: colors.secondary,
      borderRadiusLG: 16,
      fontSizeLG: 16,
      colorBgContainer: colors.secondary_light,
      colorBorder: colors.secondary_light,
    },
    InputNumber: {
      controlHeightLG: 48,
      colorText: '#111111',
      colorTextPlaceholder: colors.secondary,
      borderRadiusLG: 8,
      fontSizeLG: 16,
      colorBgContainer: colors.secondary_light,
      colorBorder: colors.secondary_light,
    },
    Select: {
      controlHeight: 38,
      borderRadiusXS: 56,
      paddingSM: 17,
      colorBorder: 'transparent',
      colorTextPlaceholder: colors.secondary,
      borderRadius: 16,
      borderRadiusLG: 16,
      colorBgContainer: colors.secondary_light,
      controlHeightLG: 56,
      boxShadowSecondary: '0px 16px 24px 0px rgba(119, 126, 144, 0.12)',
      optionSelectedBg: 'transparent',
      optionSelectedColor: colors.primary,
      optionPadding: '10px 10px',
      fontSize: 16,
      fontSizeLG: 16,
      optionFontSize: 16,
      borderRadiusSM: 16,
      optionSelectedFontWeight: 500,
    },

    Checkbox: {
      colorPrimary: colors.active,
      colorPrimaryHover: colors.active,
      borderRadius: 8,
      borderRadiusOuter: 8,
      borderRadiusLG: 8,
      borderRadiusSM: 8,
      borderRadiusXS: 8,
      controlInteractiveSize: 24,
    },
    Slider: {
      handleColor: 'white',
      handleActiveColor: 'white',
      handleSize: 14,
      railBg: colors.secondary_light,
      railSize: 6,
      trackBg: colors.primary_dark,
      trackHoverBg: colors.primary_dark,
      dotBorderColor: colors.secondary_light,
    },
    Pagination: {
      borderRadius: 6,
    },
    Popover: {
      borderRadiusLG: 16,
    },
    Tabs: {
      inkBarColor: colors.primary,
      itemColor: colors.secondary,
      itemSelectedColor: colors.primary_dark,
      horizontalItemPadding: '0 0 30px 0',
    },
    Breadcrumb: {
      itemColor: colors.primary_dark,
      linkColor: colors.primary_dark,
      lastItemColor: colors.secondary_light,
      linkHoverColor: colors.secondary,
      colorBgTextHover: 'transparent',
      separatorMargin: 12,
      paddingXXS: 0,
    },
    Progress: {
      defaultColor: colors.active,
      remainingColor: 'white',
    },
    Radio: {
      colorPrimary: colors.active,
      dotSize: 0,
    },
    Message: {
      boxShadow:
        '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    },
  },
}

export default theme
