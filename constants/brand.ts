import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

export type IonName = ComponentProps<typeof Ionicons>['name'];

export const APP_NAME = 'SPKS Exam Academy';

export const Brand = {
  indigo: ['#1E1B4B', '#4338CA'] as [string, string],
  indigoSoft: ['#4338CA', '#7C3AED'] as [string, string],
  teal: ['#0F766E', '#14B8A6'] as [string, string],
  blue: ['#1E3A8A', '#3B82F6'] as [string, string],
  orange: ['#C2410C', '#F97316'] as [string, string],
  rose: ['#9D174D', '#F43F5E'] as [string, string],
  green: ['#065F46', '#10B981'] as [string, string],
  slate: ['#0F172A', '#334155'] as [string, string],
};

export const ICON_TINTS = [
  { bg: '#EEF2FF', darkBg: '#312E81', color: '#4338CA' },
  { bg: '#F0FDFA', darkBg: '#134E4A', color: '#0F766E' },
  { bg: '#EFF6FF', darkBg: '#1E3A8A', color: '#2563EB' },
  { bg: '#FFF7ED', darkBg: '#7C2D12', color: '#EA580C' },
  { bg: '#FDF2F8', darkBg: '#831843', color: '#DB2777' },
  { bg: '#ECFDF5', darkBg: '#14532D', color: '#059669' },
];

export function iconTint(index: number) {
  return ICON_TINTS[index % ICON_TINTS.length];
}

export function courseBrand(title?: string) {
  const key = (title || '').toLowerCase();
  if (key.includes('rrb')) {
    return { icon: 'bus' as IonName, gradient: Brand.teal, tag: 'Transport' };
  }
  if (key.includes('tnusrb') || key.includes('police')) {
    return { icon: 'shield-checkmark' as IonName, gradient: Brand.blue, tag: 'Police' };
  }
  if (key.includes('current')) {
    return { icon: 'newspaper' as IonName, gradient: Brand.orange, tag: 'Daily' };
  }
  return { icon: 'library' as IonName, gradient: Brand.indigoSoft, tag: 'Govt exams' };
}

export const SPKS_LOGO = require('../assets/images/spks-logo.jpg');
