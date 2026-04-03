'use client';

import { useHamburger } from '@/hooks/useHamburger';
import Nav from './Nav';
import HamburgerMenu from './HamburgerMenu';

export default function NavWrapper() {
  const { isOpen, open, close } = useHamburger();

  return (
    <>
      <Nav onHamburgerClick={open} />
      <HamburgerMenu isOpen={isOpen} onClose={close} />
    </>
  );
}
