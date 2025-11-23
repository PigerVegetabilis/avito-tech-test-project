import { useEffect, useState, useCallback } from 'react'
import './List.css'
import axios from 'axios'
import { Button, Checkbox, FormControl,
  FormControlLabel, FormGroup, TextField,
  InputLabel, Select, MenuItem, FormLabel, RadioGroup, Radio } from '@mui/material'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'


function List() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState([]);
  const [allFilteredAds, setAllFilteredAds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status')?.split(',') || ['pending', 'rejected', 'approved'],
    categoryId: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 10,
    sortBy: searchParams.get('sort') ||''
  });
  const [category, setCategory] = useState(filters.categoryId);
  const [status, setStatus] = useState(filters.status);
  const [priority, setPriority] = useState(filters.sortBy);
  const [searchInput, setSearchInput] = useState(filters.search);

  const fetchAllFilteredIds = async () => {
      try {
        const apiParams: any = {
          limit: 1000, // Большой лимит чтобы получить все
          fields: 'id' // Запрашиваем только ID для экономии
        };
        
        if (filters.search) apiParams.search = filters.search;
        if (filters.categoryId) apiParams.categoryId = filters.categoryId;
        if (filters.sortBy) apiParams.sortBy = filters.sortBy;
        
        if (filters.status.length > 0) {
          apiParams.status = filters.status;
        }

        const response = await axios.get('http://localhost:3001/api/v1/ads', {
          params: apiParams
        });
        
        const allIds = response.data.ads.map((ad: any) => ad.id);
        setAllFilteredAds(allIds);
        
        console.log('All filtered IDs:', allIds.length); // Для отладки
      } catch (err) {
        console.error('Error fetching all filtered IDs:', err);
      }
  };


  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.status.length > 0) params.set('status', filters.status.join(','));
    if (filters.categoryId) params.set('category', filters.categoryId);
    if (filters.search) params.set('search', filters.search);
    if (filters.page > 1) params.set('page', filters.page.toString());
    if (filters.sortBy) params.set('sort', filters.sortBy);
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleStatusChange = (statusValue: string) => {
    setFilters(prev => {
    const newStatus = prev.status.includes(statusValue)
      ? prev.status.filter(s => s !== statusValue)
      : [...prev.status, statusValue];
    
    return { 
      ...prev, 
      status: newStatus.length > 0 ? newStatus : ['', '', ''],
      page: 1 
    };
  });
  }
  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handleSearchClick = () => {
    setFilters((prev) => ({...prev, 
      categoryId: category, 
      search: searchInput, 
      page: 1, 
      status: status, 
      sortBy: priority }));
  };
  
  const handleFilterReset = () => {
    setFilters({
    status: ['pending', 'rejected', 'approved'],
    categoryId: '',
    search: '',
    page: 1,
    limit: 10,
    sortBy: ''
    });
    
    setSearchInput('');
    setCategory('');
    setStatus(['']);
    setPriority('');
    setSearchParams({});
  };

  const handlePriorChange = (e: any) => {
    setPriority(e.target.value);
    setFilters(prev => ({ ...prev, sortBy: e.target.value, page: 1 }));
  }

  const handleCategoryChange = (e: any) => {
    setCategory(e.target.value);
    setFilters(prev => ({ ...prev, categoryId: e.target.value, page: 1 }));
  }

  const handleOpenAd = (adId: number) => {
  const filteredIds = ads.map((ad: any) => ad.id);
  navigate(`/item/${adId}`, { 
    state: { 
      filteredIds: allFilteredAds
    }
  });
  };
  
  const fetchAds = async () => {
    try {
      setLoading(true);

      const apiParams: any = {
        page: filters.page,
        limit: filters.limit
      };
      
      if (filters.search) apiParams.search = filters.search;
      if (filters.categoryId) apiParams.categoryId = filters.categoryId;
      if (filters.sortBy) apiParams.sortBy = filters.sortBy;
      
      if (filters.status.length > 0) {
        apiParams.status = filters.status;
      }

      const response = axios.get('http://localhost:3001/api/v1/ads', {
        params: apiParams
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
    fetchAllFilteredIds();
  }, [filters]);

  if (loading) return <div className="loading">Загрузка объявлений...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="filters">
        <div className="search-bar">
          <TextField label='Поиск по объявлениям' 
                  variant='outlined'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}/>
          <Button 
            variant='outlined'
            onClick={handleSearchClick}>
              Поиск
          </Button>
          <Button 
            variant='outlined'
            onClick={handleFilterReset}>
              Сбросить настройки
          </Button>
        </div>
        <div className="filter-boxes">
          <FormGroup className='status-block'>
            <FormControlLabel control={<Checkbox 
                checked={filters.status.includes('pending')}
                id='pending'
                onChange={() => handleStatusChange('pending')}/>
              } 
              label='На модерации' 
              />
            <FormControlLabel control={<Checkbox 
                checked={filters.status.includes('rejected')}
                id='rejected'
                onChange={() => handleStatusChange('rejected')}/>} 
              label='Отклонено'
              />
            <FormControlLabel control={<Checkbox 
                checked={filters.status.includes('approved')}
                id='approved'
                onChange={() => handleStatusChange('approved')}/>} 
              label='Одобрено' 
              />
          </FormGroup>
        <FormControl className='select-category'>
          <InputLabel id="simple-select-category">Категория</InputLabel>
          <Select
            labelId="simple-select-label"
            id="simple-select"
            value={category}
            label="Age"
            onChange={handleCategoryChange}
          >
            <MenuItem value={'1'}>Недвижимость</MenuItem>
            <MenuItem value={'2'}>Транспорт</MenuItem>
            <MenuItem value={'3'}>Работа</MenuItem>
            <MenuItem value={'4'}>Услуги</MenuItem>
            <MenuItem value={'5'}>Животные</MenuItem>
            <MenuItem value={'6'}>Мода</MenuItem>
            <MenuItem value={'7'}>Детское</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel id="buttons-priority-label">Сортировка</FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="radio-buttons-group"
            value={priority}
            onChange={handlePriorChange}
          >
            <FormControlLabel value="priority" control={<Radio />} label="По приоритету" />
            <FormControlLabel value="createdAt" control={<Radio />} label="По дате" />
            <FormControlLabel value="price" control={<Radio />} label="По цене" />
            <FormControlLabel value="" control={<Radio />} label="По умолчанию" />
          </RadioGroup>
        </FormControl>
        </div>
      </div>
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
                onClick={() => handleOpenAd(ad.id)}
                color='success'>
                  Открыть
                </Button>
            </div>
          ))
        }
      </div>
      <div className="pagination">
        <button 
          disabled={filters.page === 1}
          onClick={() => handlePageChange(filters.page - 1)}
        >
          Назад
        </button>
        
        <span>Страница {filters.page}</span>
        
        <button 
          disabled={ads.length < 10}
          onClick={() => handlePageChange(filters.page + 1)}
        >
          Вперед
        </button>
      </div>
    </div>
  )
}

export default List
