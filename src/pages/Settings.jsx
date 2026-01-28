import { RiSettings4Line, RiUserLine, RiLockLine, RiNotification3Line, RiPaletteLine } from 'react-icons/ri';

const Settings = () => {
  const settingSections = [
    { icon: RiUserLine, title: 'Profile Settings', description: 'Manage your account information' },
    { icon: RiLockLine, title: 'Security', description: 'Password and authentication settings' },
    { icon: RiNotification3Line, title: 'Notifications', description: 'Configure notification preferences' },
    { icon: RiPaletteLine, title: 'Appearance', description: 'Customize your interface' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <RiSettings4Line className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Manage your application preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingSections.map((section, index) => (
          <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <section.icon className="text-2xl text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{section.title}</h3>
                <p className="text-gray-400 text-sm">{section.description}</p>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">General Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-gray-400 text-sm">Receive email updates about your activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Push Notifications</p>
              <p className="text-gray-400 text-sm">Receive push notifications on your devices</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
