
import React from 'react';
import { Page, Breakpoint } from '../store/WebsiteStore';
import { Smartphone, Tablet, Monitor, Play, Code, Plus } from 'lucide-react';

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
  setBreakpoint
}: NavbarProps) => {
  return (
    <div className="bg-white shadow-md">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600 mr-6">WebBuilder</h1>

          {/* Pages */}
          <div className="flex items-center space-x-1">
            {pages.map(page => (
              <button
                key={page.id}
                className={`px-3 py-1 text-sm rounded ${
                  currentPageId === page.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => onChangePage(page.id)}
              >
                {page.name}
              </button>
            ))}

            <button
              className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded"
              onClick={() => onAddPage(`Page ${pages.length + 1}`)}
              title="Add new page"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Responsive Breakpoints */}
          <div className="border rounded overflow-hidden flex mr-2">
            <button
              className={`p-2 ${
                breakpoint === 'mobile' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600'
              }`}
              onClick={() => setBreakpoint('mobile')}
              title="Mobile View"
            >
              <Smartphone size={18} />
            </button>
            <button
              className={`p-2 ${
                breakpoint === 'tablet' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600'
              }`}
              onClick={() => setBreakpoint('tablet')}
              title="Tablet View"
            >
              <Tablet size={18} />
            </button>
            <button
              className={`p-2 ${
                breakpoint === 'desktop' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600'
              }`}
              onClick={() => setBreakpoint('desktop')}
              title="Desktop View"
            >
              <Monitor size={18} />
            </button>
          </div>

          {/* Preview Toggle */}
          <button
            className={`px-4 py-2 rounded text-sm flex items-center ${
              isPreviewMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            onClick={onPreviewToggle}
          >
            <Play size={16} className="mr-1" />
            {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </button>

          {/* Export Code */}
          <button
            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center"
            onClick={onExportCode}
          >
            <Code size={16} className="mr-1" />
            Export Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
