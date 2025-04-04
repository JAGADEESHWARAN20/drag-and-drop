'use client';

import React, { useState } from 'react';
import { Page, Breakpoint } from '../store/WebsiteStore';
import { Smartphone, Tablet, Monitor, Play, Code, Plus, Menu } from 'lucide-react';
import  Button  from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavbarProps {
  pages: Page[];
  currentPageId: string;
  onChangePage: (id: string) => void;
  onAddPage: (name: string) => void;
  onPreviewToggle: () => void;
  isPreviewMode: boolean;
  onExportCode: () => void;
  breakpoint: Breakpoint;
  setBreakpoint: (breakpoint: Breakpoint) => void;
}

const Navbar = ({
  pages,
  currentPageId,
  onChangePage,
  onAddPage,
  onPreviewToggle,
  isPreviewMode,
  onExportCode,
  breakpoint,
  setBreakpoint,
}: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Card className="w-full shadow-md p-4 flex items-center justify-between bg-white">
      {/* Menu Icon */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-64 p-4">
          <h1 className="text-xl font-bold text-blue-600 mb-4">WebBuilder</h1>
          <div className="flex flex-col space-y-2">
            {pages.map((page) => (
              <Button
                key={page.id}
                variant={currentPageId === page.id ? 'outline' : 'ghost'}
                onClick={() => onChangePage(page.id)}
              >
                {page.name}
              </Button>
            ))}
            <Button variant="ghost" onClick={() => onAddPage(`Page ${pages.length + 1}`)}>
              <Plus size={18} /> Add Page
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Breakpoints */}
      <ToggleGroup type="single" value={breakpoint} onValueChange={setBreakpoint} className="hidden sm:flex space-x-2">
        <ToggleGroupItem value="mobile" title="Mobile View">
          <Smartphone size={18} />
        </ToggleGroupItem>
        <ToggleGroupItem value="tablet" title="Tablet View">
          <Tablet size={18} />
        </ToggleGroupItem>
        <ToggleGroupItem value="desktop" title="Desktop View">
          <Monitor size={18} />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <Button size="icon" variant={isPreviewMode ? 'default' : 'outline'} onClick={onPreviewToggle}>
          <Play size={20} />
        </Button>
        <Button size="icon" className="bg-green-500" onClick={onExportCode}>
          <Code size={20} />
        </Button>
      </div>
    </Card>
  );
};

export default Navbar;
