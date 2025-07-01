
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image, FileText, Video, Music } from 'lucide-react';

const Assets: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-1.5em">
      <div className="max-width-75em mx-auto">
        <div className="mb-2em">
          <h1 className="text-2rem font-bold text-gray-900 dark:text-gray-100 mb-0.5em">
            Assets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your images, videos, and other media files
          </p>
        </div>

        <div className="mb-2em">
          <Button className="gap-0.5em">
            <Upload className="h-1em w-1em" />
            Upload Assets
          </Button>
        </div>

        <div className="grid gap-1.5em">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-0.75em">
                <Image className="h-1.25em w-1.25em text-blue-500" />
                Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1em">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-0.5em flex items-center justify-center">
                  <Image className="h-2em w-2em text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-0.5em flex items-center justify-center border-0.125em border-dashed border-gray-300 dark:border-gray-600">
                  <Upload className="h-1.5em w-1.5em text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-0.75em">
                <Video className="h-1.25em w-1.25em text-green-500" />
                Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-2em text-gray-500 dark:text-gray-400">
                No videos uploaded yet
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-0.75em">
                <FileText className="h-1.25em w-1.25em text-purple-500" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-2em text-gray-500 dark:text-gray-400">
                No documents uploaded yet
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Assets;
