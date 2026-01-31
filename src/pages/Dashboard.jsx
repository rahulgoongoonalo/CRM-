import { RiUserLine, RiCheckboxCircleLine, RiTimeLine, RiTicket2Line, RiCheckLine, RiFileTextLine, RiUserFollowLine, RiCurrencyLine } from 'react-icons/ri';

const Dashboard = () => {
  const stats = [
    { 
      number: '1', 
      title: 'Total Members', 
      value: '1,247', 
      change: '+12%', 
      changePositive: true,
      bgColor: 'bg-blue-900/30',
      iconBg: 'bg-blue-600',
      border: 'border-slate-700/50'
    },
    { 
      number: '1', 
      title: 'Active Members', 
      value: '1,089', 
      change: '+8%', 
      changePositive: true,
      bgColor: 'bg-emerald-900/30',
      iconBg: 'bg-emerald-600',
      border: 'border-slate-700/50'
    },
    { 
      number: '3', 
      title: 'Pending Onboarding', 
      value: '34', 
      change: '-5%', 
      changePositive: false,
      bgColor: 'bg-orange-900/30',
      iconBg: 'bg-orange-600',
      border: 'border-slate-700/50'
    },
    { 
      number: '1', 
      title: 'Open Tickets', 
      value: '18', 
      change: '+3%', 
      changePositive: true,
      bgColor: 'bg-purple-900/30',
      iconBg: 'bg-purple-600',
      border: 'border-slate-700/50'
    },
  ];

  const onboardingPipeline = [
    {
      level: 'Level 1 - Initial Contact',
      count: 12,
      members: [
        { name: 'Neha Kakkar', source: 'Open Inbound', avatar: 'NK' }
      ]
    },
    {
      level: 'Level 2 - Vetting',
      count: 8,
      members: [
        { name: 'Badshah', source: 'Special Curated', avatar: 'BD' }
      ]
    },
    {
      level: 'Level 3 - Onboarding',
      count: 14,
      members: [
        { name: 'Sunidhi Chau...', source: 'Personal Reference', avatar: 'SC' },
        { name: 'Arijit Singh', source: 'Curated Artist', avatar: 'AS' }
      ]
    }
  ];

  const recentActivity = [
    { action: 'New member registration', name: 'Neha Kakkar', time: '2 hours ago', icon: RiUserFollowLine, color: 'text-blue-400' },
    { action: 'KYC approved', name: 'Arijit Singh', time: '4 hours ago', icon: RiCheckLine, color: 'text-emerald-400' },
    { action: 'Contract signed', name: 'Shreya Ghoshal', time: '6 hours ago', icon: RiFileTextLine, color: 'text-blue-400' },
    { action: 'Royalty disbursed', name: 'Sunidhi Chauhan', time: '1 day ago', icon: RiCurrencyLine, color: 'text-blue-400' },
  ];

  const pendingTasks = [
    { task: 'Complete KYC Documentation', member: 'Neha Kakkar', assignee: 'Vishal Onkar', priority: 'High', dueDate: '2026-01-25', status: 'In Progress' },
    { task: 'Contract Negotiation Meeting', member: 'Badshah', assignee: 'Soumini Paul', priority: 'Medium', dueDate: '2026-01-28', status: 'Pending' },
    { task: 'Internal Vetting Approval', member: 'Badshah', assignee: 'Aayan De', priority: 'High', dueDate: '2026-01-24', status: 'In Progress' },
    { task: 'Tech Onboarding - G Artists App', member: 'Neha Kakkar', assignee: 'Joshua Singh', priority: 'Medium', dueDate: '2026-02-01', status: 'Pending' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-5 border ${stat.border}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`${stat.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold`}>
                {stat.number}
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded ${stat.changePositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-gray-400 text-sm mb-1">{stat.title}</div>
            <div className="text-white text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Onboarding Pipeline */}
        <div className="lg:col-span-2 bg-[#1e2a3a] rounded-lg p-6 border border-slate-700/50">
          <h2 className="text-white text-lg font-semibold mb-4">Onboarding Pipeline</h2>
          <div className="grid grid-cols-3 gap-4">
            {onboardingPipeline.map((stage, index) => (
              <div key={index} className="bg-[#0f1419] rounded-lg p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-sm font-medium">{stage.level}</h3>
                  <span className="bg-slate-700 text-gray-300 text-xs px-2 py-1 rounded-full">{stage.count}</span>
                </div>
                <div className="space-y-3">
                  {stage.members.map((member, mIndex) => (
                    <div key={mIndex} className="bg-[#1e2a3a] rounded-lg p-3 border border-slate-700/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-slate-700 text-white text-xs font-semibold w-10 h-10 rounded-lg flex items-center justify-center">
                          {member.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{member.name}</div>
                          <div className="text-gray-400 text-xs">{member.source}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1e2a3a] rounded-lg p-6 border border-slate-700/50">
          <h2 className="text-white text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium mb-1">{activity.action}</p>
                  <p className="text-gray-400 text-xs">{activity.name} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="bg-[#1e2a3a] rounded-lg p-4 md:p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-semibold">Pending Tasks</h2>
          <a href="#" className="text-blue-400 text-sm hover:text-blue-300">View All →</a>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-700/50">
              <tr>
                <th className="text-left text-gray-400 text-xs font-semibold pb-3 uppercase">Task</th>
                <th className="text-left text-gray-400 text-xs font-semibold pb-3 uppercase">Member</th>
                <th className="text-left text-gray-400 text-xs font-semibold pb-3 uppercase">Assignee</th>
                <th className="text-left text-gray-400 text-xs font-semibold pb-3 uppercase">Priority</th>
                <th className="text-left text-gray-400 text-xs font-semibold pb-3 uppercase">Due Date</th>
                <th className="text-left text-gray-400 text-xs font-semibold pb-3 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingTasks.map((task, index) => (
                <tr key={index} className="border-b border-slate-700/30">
                  <td className="py-4 text-white text-sm font-medium">{task.task}</td>
                  <td className="py-4 text-gray-300 text-sm">{task.member}</td>
                  <td className="py-4 text-blue-400 text-sm">{task.assignee}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-4 text-gray-300 text-sm">{task.dueDate}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {pendingTasks.map((task, index) => (
            <div key={index} className="bg-[#243447] rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white text-sm font-semibold mb-1">{task.task}</h3>
                  <p className="text-gray-300 text-xs">{task.member}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Assignee:</span>
                  <span className="text-blue-400 ml-1">{task.assignee}</span>
                </div>
                <div>
                  <span className="text-gray-400">Due:</span>
                  <span className="text-gray-300 ml-1">{task.dueDate}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
