import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import { Sidebar, SidebarProvider, useSidebar } from '@/components/layout';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft } from 'lucide-react';

const SettingsContent = () => {
  const { userProfile, displayName, email } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const { collapsed, toggleSidebar } = useSidebar();

  const [name, setName] = useState(userProfile?.name || displayName || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          {/* Back Button */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

          {/* Profile Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Display Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email || ''}
                    disabled
                    className="mt-1 bg-gray-100 dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Toggle between light and dark theme
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Signing in with</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your account is managed through Clerk
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://dashboard.clerk.com', '_blank')}
                >
                  Manage Clerk Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

const Settings = () => {
  return (
    <SidebarProvider>
      <SettingsContent />
    </SidebarProvider>
  );
};

export default Settings;