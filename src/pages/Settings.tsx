
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Globe, Palette, Code, Shield } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-1.5em">
      <div className="max-width-75em mx-auto">
        <div className="mb-2em">
          <h1 className="text-2rem font-bold text-gray-900 dark:text-gray-100 mb-0.5em">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your website settings and preferences
          </p>
        </div>

        <div className="grid gap-1.5em">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-0.75em">
                <Globe className="h-1.25em w-1.25em text-blue-500" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5em">
              <div className="space-y-0.5em">
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" placeholder="My Website" />
              </div>
              <div className="space-y-0.5em">
                <Label htmlFor="site-description">Site Description</Label>
                <Input id="site-description" placeholder="A beautiful website built with our builder" />
              </div>
              <div className="space-y-0.5em">
                <Label htmlFor="site-url">Site URL</Label>
                <Input id="site-url" placeholder="https://mywebsite.com" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-0.75em">
                <Palette className="h-1.25em w-1.25em text-purple-500" />
                Theme Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5em">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-0.875rem text-gray-600 dark:text-gray-400">
                    Enable dark theme for the editor
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Grid Snap</Label>
                  <p className="text-0.875rem text-gray-600 dark:text-gray-400">
                    Snap elements to grid when moving
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-0.75em">
                <Code className="h-1.25em w-1.25em text-green-500" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5em">
              <div className="space-y-0.5em">
                <Label htmlFor="custom-css">Custom CSS</Label>
                <textarea
                  id="custom-css"
                  className="w-full h-8em p-0.75em border border-gray-300 dark:border-gray-600 rounded-0.375em bg-white dark:bg-gray-800"
                  placeholder="/* Add your custom CSS here */"
                />
              </div>
              <div className="space-y-0.5em">
                <Label htmlFor="custom-js">Custom JavaScript</Label>
                <textarea
                  id="custom-js"
                  className="w-full h-8em p-0.75em border border-gray-300 dark:border-gray-600 rounded-0.375em bg-white dark:bg-gray-800"
                  placeholder="// Add your custom JavaScript here"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-0.75em">
                <Shield className="h-1.25em w-1.25em text-red-500" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5em">
              <div className="flex items-center justify-between">
                <div>
                  <Label>SEO Indexing</Label>
                  <p className="text-0.875rem text-gray-600 dark:text-gray-400">
                    Allow search engines to index your site
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Analytics</Label>
                  <p className="text-0.875rem text-gray-600 dark:text-gray-400">
                    Enable website analytics tracking
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-0.75em">
            <Button variant="outline">Reset to Defaults</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
