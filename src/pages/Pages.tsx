
import React from 'react';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Settings, Eye } from 'lucide-react';

const Pages: React.FC = () => {
  const { currentProject } = useEnhancedWebsiteStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-1.5em">
      <div className="max-width-75em mx-auto">
        <div className="mb-2em">
          <h1 className="text-2rem font-bold text-gray-900 dark:text-gray-100 mb-0.5em">
            Pages
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your website pages and their settings
          </p>
        </div>

        <div className="mb-2em">
          <Button className="gap-0.5em">
            <Plus className="h-1em w-1em" />
            New Page
          </Button>
        </div>

        <div className="grid gap-1.5em">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5em">
              <div className="flex items-center gap-0.75em">
                <FileText className="h-1.25em w-1.25em text-blue-500" />
                <div>
                  <CardTitle className="text-1.25rem">Home</CardTitle>
                  <p className="text-0.875rem text-gray-600 dark:text-gray-400">
                    Main landing page
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5em">
                <Button variant="outline" size="sm">
                  <Eye className="h-1em w-1em" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-1em w-1em" />
                  Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-1em">
              <div className="flex items-center gap-1em text-0.875rem text-gray-600 dark:text-gray-400">
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-0.5em py-0.25em rounded">
                  Published
                </span>
                <span>Last updated: 2 hours ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pages;
