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
  const [page, setPage] = useState(filters.page);

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.status.length > 0) params.set('status', filters.status.join(','));
    if (filters.categoryId) params.set('category', filters.categoryId);
    if (filters.search) params.set('search', filters.search);
    if (filters.page > 1) params.set('page', filters.page.toString());
    if (filters.sortBy) params.set('sort', filters.sortBy);
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleStatusChange = (e : any) => {
    const { id, checked } = e.target;
  
    setStatus(prev => {
      const newStatus = [...prev];
      
      if (id === 'pending') {
        newStatus[0] = checked ? 'pending' : '';
      } else if (id === 'rejected') {
        newStatus[1] = checked ? 'rejected' : '';
      } else if (id === 'approved') {
        newStatus[2] = checked ? 'approved' : '';
      }
      
      const filteredStatus = newStatus.filter(s => s !== '');
      setFilters(prev => ({ ...prev, status: filteredStatus, page: 1 }));

      return newStatus;
    })
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
                checked={status[0] === 'pending'}
                id='pending'
                onChange={handleStatusChange}/>
              } 
              label='На модерации' 
              />
            <FormControlLabel control={<Checkbox 
                checked={status[1] === 'rejected'}
                id='rejected'
                onChange={handleStatusChange}/>} 
              label='Отклонено'
              />
            <FormControlLabel control={<Checkbox 
                checked={status[2] === 'approved'}
                id='approved'
                onChange={handleStatusChange}/>} 
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
                onClick={() => navigate(`/item/${ad.id}`)}
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
