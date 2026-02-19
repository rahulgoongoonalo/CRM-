import { useState, useEffect, createContext, useContext } from 'react';
import { picklistAPI } from '../services/api';

const PicklistContext = createContext(null);

export const PicklistProvider = ({ children }) => {
  const [picklists, setPicklists] = useState({});
  const [rawPicklists, setRawPicklists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPicklists = async () => {
    try {
      const response = await picklistAPI.getAll();
      setRawPicklists(response.data);
      const mapped = {};
      response.data.forEach(pl => {
        mapped[pl.name] = pl.items
          .filter(i => i.isActive)
          .sort((a, b) => a.order - b.order);
      });
      setPicklists(mapped);
    } catch (err) {
      console.error('Failed to load picklists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPicklists();
  }, []);

  return (
    <PicklistContext.Provider value={{ picklists, rawPicklists, loading, refetch: fetchPicklists }}>
      {children}
    </PicklistContext.Provider>
  );
};

export const usePicklist = (name) => {
  const context = useContext(PicklistContext);
  if (!context) {
    return { items: [], loading: true };
  }
  return { items: context.picklists[name] || [], loading: context.loading };
};

export const usePicklists = () => {
  const context = useContext(PicklistContext);
  if (!context) {
    return { picklists: {}, rawPicklists: [], loading: true, refetch: () => {} };
  }
  return context;
};
