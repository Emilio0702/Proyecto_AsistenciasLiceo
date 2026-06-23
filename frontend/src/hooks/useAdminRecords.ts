import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const PER_PAGE = 10;

export function useAdminRecords() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState('');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [fechaInicio, setFechaInicio] = useState(todayStr);
  const [fechaFin, setFechaFin] = useState(todayStr);
  const [pensiones, setPensiones] = useState<any[]>([]);
  const [selectedPension, setSelectedPension] = useState('');
  const [activeDateFilter, setActiveDateFilter] = useState('hoy');

  const fetchPensiones = useCallback(async () => {
    try {
      const response = await api.get('/pensiones');
      setPensiones(response.data);
    } catch (error) {
      console.error('Error fetching pensiones:', error);
    }
  }, []);

  const fetchRegistros = useCallback(async (pageNumber: number) => {
    if (pageNumber === 0) setLoading(true);
    try {
      const pensionQuery = selectedPension ? `&pension_id=${selectedPension}` : '';
      const response = await api.get(`/colaciones?limit=${PER_PAGE}&offset=${pageNumber * PER_PAGE}&search=${searchText}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}${pensionQuery}`);
      const newData = response.data.data || [];
      if (pageNumber === 0) {
        setRegistros(newData);
      } else {
        setRegistros((prev) => [...prev, ...newData]);
      }
      setTotalRecords(response.data.total || 0);
      setPage(pageNumber);
    } catch (error) {
      console.error(error);
    } finally {
      if (pageNumber === 0) setLoading(false);
    }
  }, [searchText, fechaInicio, fechaFin, selectedPension]);

  useEffect(() => {
    fetchPensiones();
  }, [fetchPensiones]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRegistros(0);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, fechaInicio, fechaFin, selectedPension, fetchRegistros]);

  const setDateFilter = (filterType: string) => {
    setActiveDateFilter(filterType);
    const today = new Date();
    
    if (filterType === 'hoy') {
      const todayStr = today.toISOString().split('T')[0];
      setFechaInicio(todayStr);
      setFechaFin(todayStr);
    } else if (filterType === 'mes') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      setFechaInicio(firstDay);
      setFechaFin(lastDay);
    } else if (filterType === 'año') {
      const firstDay = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
      setFechaInicio(firstDay);
      setFechaFin(lastDay);
    } else {
      setFechaInicio('');
      setFechaFin('');
    }
  };

  const clearFilters = () => {
    setFechaInicio('');
    setFechaFin('');
    setDateFilter('todos');
    setSelectedPension('');
  };

  const loadMore = () => {
    if (registros.length < totalRecords && !loading) {
      fetchRegistros(page + 1);
    }
  };

  return {
    registros,
    loading,
    totalRecords,
    searchText,
    setSearchText,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    pensiones,
    selectedPension,
    setSelectedPension,
    activeDateFilter,
    setDateFilter,
    clearFilters,
    loadMore,
    fetchRegistros
  };
}
