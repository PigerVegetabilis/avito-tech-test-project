import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function List() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    categoryId: '',
    search: '',
    page: 1,
    limit: 10
  });

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = axios.get('http://localhost:3001/api/v1/ads', {
        params: filters
      });
      setAds((await response).data.ads);
    }
    catch (err){
      setError('Ошибка загрузки объявлений');
      console.error('Error fetching ads:', err);
    }
    finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [filters]);

  if (loading) return <div className="loading">Загрузка объявлений...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      
    </>
  )
}

export default List
