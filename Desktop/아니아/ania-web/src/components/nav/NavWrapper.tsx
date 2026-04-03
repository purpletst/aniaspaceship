'use client';

import { useState } from 'react';
import { useHamburger } from '@/hooks/useHamburger';
import Nav from './Nav';
import HamburgerMenu from './HamburgerMenu';
import SearchModal from '@/components/search/SearchModal';

export default function NavWrapper() {
  const { isOpen, open, close } = useHamburger();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Nav onHamburgerClick={open} onSearchClick={() => setSearchOpen(true)} />
      <HamburgerMenu isOpen={isOpen} onClose={close} onSearchClick={() => setSearchOpen(true)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
