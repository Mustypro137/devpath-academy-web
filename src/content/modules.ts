import type { Module } from '../types/content'

// Modules in the order learners should take them.
export const MODULES: readonly Module[] = [
  {
    id: 'html',
    title: 'HTML',
    summary: 'The structure and meaning of a web page.',
  },
  {
    id: 'css',
    title: 'CSS',
    summary: 'How a page looks: colour, spacing, and layout.',
  },
  {
    id: 'js',
    title: 'JavaScript',
    summary: 'Making pages interactive with code.',
  },
]
