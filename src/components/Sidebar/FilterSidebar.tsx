import React, { useState, useEffect } from 'react';
import styles from './FiltroComponent.module.css';
import { useFilters } from '../../context/FilterContext';
import { RxCrossCircled } from "react-icons/rx";

interface Subcategory {
  name: string;
}

interface Category {
  name: string;
  field: 'category' | 'brand' | 'priceRange';
  subcategories: Subcategory[];
}

const FilterSidebar = () => {
  const categories: Category[] = [
    {
      name: "Price",
      field: "priceRange",
      subcategories: [
        { name: "0 - 300" },
        { name: "300 - 500" },
        { name: "500 - 800" },
        { name: "800 - 1200" },
        { name: "1200 - 2000" },
        { name: "2000+" }
      ]
    },
    {
      name: "Category",
      field: "category",
      subcategories: [
        { name: "Components" },
        { name: "Laptops" },
        { name: "Peripherals & Setup" },
        { name: "Mobile Devices" }
      ]
    },
    {
      name: "Brand",
      field: "brand",
      subcategories: [
        { name: "Samsung" },
        { name: "Apple" },
        { name: "Sony" },
        { name: "Logitech" },
        { name: "Razer" },
        { name: "Corsair" }
      ]
    }
  ];

  const { filters, setFilters, clearFilters } = useFilters();
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);

  const handleCategoryChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === 'all' ? undefined : value
    }));
  };

  const handlePriceRangeChange = (range: string) => {
    if (range === 'all') {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters.precio; // Elimina completamente el filtro de precio
        return newFilters;
      });
      return;
    }
  
    let min: number;
    let max: number | undefined;
  
    if (range === "2000+") {
      min = 2000;
      max = undefined;
    } else {
      const [minStr, maxStr] = range.split(" - ");
      min = parseInt(minStr);
      max = parseInt(maxStr);
    }
  
    setFilters(prev => ({
      ...prev,
      precio: {
        min,
        max
      }
    }));
  };
  
  const isPriceRangeSelected = (range: string): boolean => {
    if (range === 'all') return !filters.precio; // Verifica si no existe filtro de precio
    
    if (!filters.precio) return false;
    
    if (range === "2000+") {
      return filters.precio.min === 2000 && !filters.precio.max;
    }
    
    const [minStr, maxStr] = range.split(" - ");
    return filters.precio.min === parseInt(minStr) && 
           filters.precio.max === parseInt(maxStr);
  };




  const resetFilters = () => {
    clearFilters(); // Usa la función clearFilters del contexto
  };


  return (
    <div className={styles.filtroContainer}>
      <button 
        className={styles.mobileFilterButton}
        onClick={() => setMobileFiltersVisible(!mobileFiltersVisible)}
      >
        {mobileFiltersVisible ? 'Hide filters' : 'Show filters'}
      </button>
      
      <div className={`${styles.filtroContent} ${mobileFiltersVisible ? styles.mobileVisible : ''}`}>
        <div className={styles.filtroHeader}>
          <h3>Filters</h3>
          <button onClick={resetFilters} className={styles.limpiarButton}>
            Clean everything
          </button>

          </div>
          <button 
        onClick={() => setMobileFiltersVisible(false)}
        className={styles.closeButtonsitoski}
        >
            <RxCrossCircled className='closeButtonsitoski' size={28} />
        </button>
          
  
        {categories.map((category) => {
          const groupName = `filter-${category.field}`;
          const isAllSelected = category.field === 'priceRange' 
            ? !filters.precio?.min && !filters.precio?.max
            : !filters[category.field];
          
          return (
            <div key={category.field} className={styles.filtroSeccion}>
              <div className={styles.categoriaHeader}>
                <h4>{category.name}</h4>
              </div>
              <ul className={styles.subcategoriaList}>
                <li className={styles.radioListItem}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name={groupName}
                      checked={isAllSelected}
                      onChange={() => 
                        category.field === 'priceRange' 
                          ? handlePriceRangeChange('all') 
                          : handleCategoryChange(category.field, 'all')
                      }
                      className={styles.radioInput}
                    />
                    <span className={styles.radioText}>All</span>
                    <span className={`${styles.radioMark} ${isAllSelected ? styles.activo : ''}`}></span>
                  </label>
                </li>
  
                {category.subcategories.map((subcategory) => {
                  const isActive = category.field === 'priceRange'
                    ? isPriceRangeSelected(subcategory.name)
                    : filters[category.field] === subcategory.name;
                  
                  return (
                    <li key={subcategory.name} className={styles.radioListItem}>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name={groupName}
                          checked={isActive}
                          onChange={() => 
                            category.field === 'priceRange'
                              ? handlePriceRangeChange(subcategory.name)
                              : handleCategoryChange(category.field, subcategory.name)
                          }
                          className={styles.radioInput}
                        />
                        <span className={styles.radioText}>
                          {category.field === 'priceRange' ? `$${subcategory.name}` : subcategory.name}
                        </span>
                        <span className={`${styles.radioMark} ${isActive ? styles.activo : ''}`}></span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilterSidebar;