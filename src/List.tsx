import { useEffect, useState } from 'react'
import './List.css'
import axios from 'axios'
import { Button } from '@mui/material'
import { Navigate, useNavigate } from 'react-router-dom'

function List() {
  const navigate = useNavigate();
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
    <div className='AdsList'>
      {
        ads.map((ad : any) => (
          <div key={ad.id} className='ad-card'>
            <div className="ad-info">
              <div className="ad-image">
              <img src={ad.images?.[0].replace('.co', '.jp')} 
              alt={ad.title} />
            </div>

            <div className="ad-content">
              <h3 className="ad-title">{ad.title.split(':')[1]}</h3>
              <p className="ad-price">{ad.price.toLocaleString()} ₽</p>
              <p className="ad-category">{ad.category}</p>
              <div className="ad-meta">
                <span className='ad-status'>
                  {ad.status + ' '} 
                </span>
                <span className='ad-prority'>
                  {ad.priority + ' '}
                </span>
                <span className="ad-date">
                  {new Date(ad.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>

            </div>
            </div>

            <Button 
              variant='outlined' 
              onClick={() => navigate(`/item/${ad.id}`)}>
                Открыть
              </Button>
          </div>
        ))
      }
    </div>
  )
}

export default List
