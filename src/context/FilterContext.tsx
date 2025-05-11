// context/FilterContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type PriceFilter = {
  min?: number;
  max?: number;
};

type Filters = {
  [key: string]: string | PriceFilter | undefined; // undefined para cuando se elimina un filtro
  precio?: PriceFilter;
};

interface FiltersContextType {
  filters: Filters;
  setFilters: (value: Filters | ((prev: Filters) => Filters)) => void;
  clearFilters: () => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<Filters>({});
  
  const clearFilters = () => {
    setFilters({});
  };

  return (
    <FiltersContext.Provider value={{ filters, setFilters, clearFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
};