import { RiUserLine, RiCheckboxCircleLine, RiTimeLine, RiTicket2Line, RiCheckLine, RiFileTextLine, RiUserFollowLine, RiCurrencyLine } from 'react-icons/ri';

const Dashboard = () => {
  const stats = [
    { 
      number: '1', 
      title: 'Total Members', 
      value: '1,247', 
      change: '+12%', 
      changePositive: true,
      bgColor: 'bg-surface-card',
      iconBg: 'bg-gradient-to-br from-brand-primary to-brand-secondary',
      border: 'border-border'
    },
    { 
      number: '1', 
      title: 'Active Members', 
      value: '1,089', 
      change: '+8%', 
      changePositive: true,
      bgColor: 'bg-surface-card',
      iconBg: 'bg-gradient-to-br from-emerald-600 to-emerald-700',
      border: 'border-border'
    },
    { 
      number: '3', 
      title: 'Pending Onboarding', 
      value: '34', 
      change: '-5%', 
      changePositive: false,
      bgColor: 'bg-surface-card',
      iconBg: 'bg-gradient-to-br from-brand-accent to-brand-highlight',
      border: 'border-border'
    },
    { 
      number: '1', 
      title: 'Open Tickets', 
      value: '18', 
      change: '+3%', 
      changePositive: true,
      bgColor: 'bg-surface-card',
      iconBg: 'bg-gradient-to-br from-brand-secondary to-brand-accent',
      border: 'border-border'
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
        return 'badge-danger';
      case 'Medium':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'badge-primary';
      case 'Pending':
        return 'badge-warning';
      default:
        return 'bg-surface-lighter/50 text-text-muted border border-border';
    }
  };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-5 border ${stat.border} card-hover shadow-lg shadow-brand-primary/5`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`${stat.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-primary/30`}>
                {stat.number}
              </div>
              <span className={`text-sm font-semibold px-2 py-1 rounded ${stat.changePositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-text-muted text-sm mb-1 font-medium">{stat.title}</div>
            <div className="text-text-primary text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Onboarding Pipeline */}
        <div className="lg:col-span-2 card shadow-lg shadow-brand-primary/10">
          <h2 className="text-text-primary text-lg font-bold mb-4">Onboarding Pipeline</h2>
          <div className="grid grid-cols-3 gap-4">
            {onboardingPipeline.map((stage, index) => (
              <div key={index} className="bg-surface-lighter rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-text-primary text-sm font-semibold">{stage.level}</h3>
                  <span className="bg-surface text-text-secondary text-xs px-2 py-1 rounded-full font-medium">{stage.count}</span>
                </div>
                <div className="space-y-3">
                  {stage.members.map((member, mIndex) => (
                    <div key={mIndex} className="bg-surface-card rounded-lg p-3 border border-border hover:border-brand-primary transition-all">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white text-xs font-bold w-10 h-10 rounded-lg flex items-center justify-center shadow-md shadow-brand-primary/30">
                          {member.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-text-primary text-sm font-semibold truncate">{member.name}</div>
                          <div className="text-text-muted text-xs">{member.source}</div>
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
        <div className="card shadow-lg shadow-brand-primary/10">
          <h2 className="text-text-primary text-lg font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-br from-brand-accent to-brand-highlight rounded-full mt-2 shadow-md"></div>
                <div className="flex-1">
                  <p className="text-text-primary text-sm font-semibold mb-1">{activity.action}</p>
                  <p className="text-text-muted text-xs">{activity.name} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="card shadow-lg shadow-brand-primary/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary text-lg font-bold">Pending Tasks</h2>
          <a href="#" className="text-brand-accent text-sm hover:text-brand-highlight font-semibold transition-colors">View All →</a>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left text-text-muted text-xs font-bold pb-3 uppercase tracking-wider">Task</th>
                <th className="text-left text-text-muted text-xs font-bold pb-3 uppercase tracking-wider">Member</th>
                <th className="text-left text-text-muted text-xs font-bold pb-3 uppercase tracking-wider">Assignee</th>
                <th className="text-left text-text-muted text-xs font-bold pb-3 uppercase tracking-wider">Priority</th>
                <th className="text-left text-text-muted text-xs font-bold pb-3 uppercase tracking-wider">Due Date</th>
                <th className="text-left text-text-muted text-xs font-bold pb-3 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingTasks.map((task, index) => (
                <tr key={index} className="table-row">
                  <td className="py-4 text-text-primary text-sm font-semibold">{task.task}</td>
                  <td className="py-4 text-text-secondary text-sm">{task.member}</td>
                  <td className="py-4 text-brand-accent text-sm font-medium">{task.assignee}</td>
                  <td className="py-4">
                    <span className={`${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-4 text-text-secondary text-sm">{task.dueDate}</td>
                  <td className="py-4">
                    <span className={`${getStatusColor(task.status)}`}>
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
            <div key={index} className="bg-surface-card rounded-lg p-4 border border-border card-hover shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-text-primary text-sm font-bold mb-1">{task.task}</h3>
                  <p className="text-text-secondary text-xs">{task.member}</p>
                </div>
                <span className={`${getPriorityColor(task.priority)} whitespace-nowrap ml-2`}>
                  {task.priority}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-muted font-medium">Assignee:</span>
                  <span className="text-brand-accent ml-1 font-semibold">{task.assignee}</span>
                </div>
                <div>
                  <span className="text-text-muted font-medium">Due:</span>
                  <span className="text-text-secondary ml-1">{task.dueDate}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <span className={`${getStatusColor(task.status)}`}>
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
