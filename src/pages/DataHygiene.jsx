import { RiShieldCheckLine } from 'react-icons/ri';

const DataHygiene = () => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <RiShieldCheckLine className="text-3xl text-brand-primary" />
        <h1 className="text-2xl font-bold text-text-primary">Data Hygiene</h1>
      </div>
      <div className="bg-surface-light rounded-xl border border-border p-8 text-center">
        <RiShieldCheckLine className="text-6xl text-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Data Hygiene</h2>
        <p className="text-text-muted">This section is under development.</p>
      </div>
    </div>
  );
};

export default DataHygiene;
