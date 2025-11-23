import { Button, IconButton} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import axios from "axios";
import { useState , useEffect} from "react";
import { useParams, Link, useNavigate, Navigate, useLocation } from "react-router-dom"

export default function Item(){
    const navigate = useNavigate();
    const location = useLocation();
    const {id} = useParams();
    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState([]);
    const [error, setError] = useState('');
    const [nextAds, setNextAds] = useState<{ prev: number | null; next: number | null }>({
        prev: null,
        next: null
    });
    const [filteredIds, setFilteredIds] = useState<number[]>([]);

    const fetchItem = async (adId?: string) => {
        const adIdToFetch = adId || id;
        if (!adIdToFetch) return;
        try{
            const response = axios.get('http://localhost:3001/api/v1/ads/' + adIdToFetch);
            setInfo((await response).data);
            window.history.replaceState(
                { filteredIds : filteredIds },
                '',
                `/item/${adIdToFetch}`
            );
        }
        catch (err){
            setError('Ошибка загрузки объявления');
            console.error('Error fetching ad:', err);
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        if (location.state?.filteredIds) {
            setFilteredIds(location.state.filteredIds);
        }
    }, [location.state]);

    useEffect(() => {
        if (filteredIds.length > 0 && id) {
            const currentIndex = filteredIds.indexOf(parseInt(id));
            const prevId = currentIndex > 0 ? filteredIds[currentIndex - 1] : null;
            const nextId = currentIndex < filteredIds.length - 1 ? filteredIds[currentIndex + 1] : null;
            
            setNextAds({
                prev: prevId,
                next: nextId
            });
        }
    }, [filteredIds, id]);

    const handlePrevAd = () => {
        if (nextAds.prev) {
            navigate(`/item/${nextAds.prev}`, { 
                state: { filteredIds: filteredIds },
                replace: true
            });
        }
    };

    const handleNextAd = () => {
        if (nextAds.next) {
            navigate(`/item/${nextAds.next}`, { 
                state: { filteredIds: filteredIds },
                replace: true
            });
        }
    };

    useEffect(() => {
        if (id) {
            fetchItem(id);
        }
    }, [id]);
    
      if (loading) return <div className="loading">Загрузка объявлений...</div>;
      if (error) return <div className="error">{error}</div>;

    return (
    <>
        <h1>{(info as any).title}</h1>
        <div className="item-block-first">
            <div className="ad-image">
                <img src={(info as any).images?.[0].replace('.co', '.jp')} 
                alt={(info as any).title} />
                <img src={(info as any).images?.[1].replace('.co', '.jp')} 
                alt={(info as any).title} />
                <img src={(info as any).images?.[2].replace('.co', '.jp')} 
                alt={(info as any).title} />
            </div>
            <div className="admin-history">
                История модерации<br/>
                {(info as any).moderationHistory.map((commit : any) => (<>
                    <span>{commit.moderatorName}<br/></span>
                    <span>{new Date(commit.timestamp).toLocaleDateString('ru-RU') + ' '} 
                        {new Date(commit.timestamp).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}<br/></span>
                    <span>{commit.action}<br/></span>
                    <span>{commit.comment}<br/></span>
                </>))}
            </div>
        </div>
        <div className="item-description">
            <h3>Описание</h3>
            <span>{(info as any).description} <br /></span>
            <h3>Характеристики</h3>
            {Object.keys((info as any).characteristics).map((key : string) => (
                <span key = {key}>{key + ' : '} {(info as any).characteristics[key]} <br /></span>
            ))}
            <span>{(info as any).seller.name} | {(info as any).seller.rating} <br /></span>
            <span>{(info as any).seller.totalAds} объявлений | Дата регистрации: {new Date((info as any).seller.registeredAt).toLocaleDateString('ru-RU') + ' '} </span>
        </div>
        <div className="decisions">
            <Button variant="outlined" color="success">
                Одобрить
            </Button>
            <Button variant="outlined" color="error">
                Отклонить
            </Button>
            <Button variant="outlined" color="warning">
                Доработка
            </Button>
        </div>
        <footer>
            <a href="#" onClick={(e) => {
                e.preventDefault();
                navigate(-1);
            }}>
                К списку
            </a>
            <IconButton 
                    onClick={handlePrevAd}
                    disabled={!nextAds.prev}
                    size="large"
            >
                <ChevronLeft />
                Назад
            </IconButton>
            <IconButton 
                    onClick={handleNextAd}
                    disabled={!nextAds.next}
                    size="large"
            >
                Вперед
                <ChevronRight />
            </IconButton>
        </footer>
    </>
    )
}