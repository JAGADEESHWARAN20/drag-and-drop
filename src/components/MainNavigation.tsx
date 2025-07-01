
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Box, FileText, Image, Settings, Undo, Redo } from 'lucide-react';

interface MainNavigationProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const MainNavigation: React.FC<MainNavigationProps> = ({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-1em h-3.5em flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center gap-0.5em font-medium text-1.25rem mr-2em">
            <Box className="h-1.25em w-1.25em text-blue-500" />
            BuildPro
          </div>

          <nav className="hidden md:flex space-x-0.25em">
            <Button asChild variant="ghost" size="sm">
              <NavLink to="/editor" className={({ isActive }) => isActive ? 'bg-muted text-primary' : ''}>
                Editor
              </NavLink>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <NavLink to="/pages" className={({ isActive }) => isActive ? 'bg-muted text-primary' : ''}>
                <FileText className="mr-0.5em h-1em w-1em" />
                Pages
              </NavLink>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <NavLink to="/assets" className={({ isActive }) => isActive ? 'bg-muted text-primary' : ''}>
                <Image className="mr-0.5em h-1em w-1em" />
                Assets
              </NavLink>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <NavLink to="/settings" className={({ isActive }) => isActive ? 'bg-muted text-primary' : ''}>
                <Settings className="mr-0.5em h-1em w-1em" />
                Settings
              </NavLink>
            </Button>
          </nav>
        </div>

        <div className="flex items-center space-x-0.5em">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <Undo className="h-1em w-1em" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            <Redo className="h-1em w-1em" />
          </Button>
          <Button size="sm">
            Publish
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MainNavigation;
