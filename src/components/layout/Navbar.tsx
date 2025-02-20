import { NavbarClient } from './NavbarClient'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Documents', href: '/documents' },
  { name: 'Templates', href: '/templates' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export { NavbarClient as Navbar } from './NavbarClient'
