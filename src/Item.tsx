import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import axios from "axios";
import { useState , useEffect} from "react";
import { useParams, Link, useNavigate, Navigate, useLocation } from "react-router-dom"
import './Item.css';

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
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [changesDialogOpen, setChangesDialogOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

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

    const handleApprove = async () => {
        try {
            setLoading(true);
            await axios.post(`http://localhost:3001/api/v1/ads/${id}/approve`);
            
            setSnackbar({
                open: true,
                message: 'Объявление успешно одобрено!',
                severity: 'success'
            });
            
            fetchItem(id);
            
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: `Ошибка одобрения: ${err.response?.data?.error || err.message}`,
                severity: 'error'
            });
            console.error('Error approving ad:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleReject = async () => {
        if (!reason) {
            setSnackbar({
                open: true,
                message: 'Пожалуйста, выберите причину отклонения',
                severity: 'error'
            });
            return;
        }

        try {
            setLoading(true);
            await axios.post(`http://localhost:3001/api/v1/ads/${id}/reject`, {
                reason,
                comment: comment || undefined
            });
            
            setSnackbar({
                open: true,
                message: 'Объявление успешно отклонено!',
                severity: 'success'
            });
            
            setRejectDialogOpen(false);
            resetForm();
            fetchItem(id);
            
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: `Ошибка отклонения: ${err.response?.data?.error || err.message}`,
                severity: 'error'
            });
            console.error('Error rejecting ad:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestChanges = async () => {
        if (!reason) {
            setSnackbar({
                open: true,
                message: 'Пожалуйста, выберите причину запроса изменений',
                severity: 'error'
            });
            return;
        }

        try {
            setLoading(true);
            await axios.post(`http://localhost:3001/api/v1/ads/${id}/request-changes`, {
                reason,
                comment: comment || undefined
            });
            
            setSnackbar({
                open: true,
                message: 'Запрос изменений успешно отправлен!',
                severity: 'success'
            });
            
            setChangesDialogOpen(false);
            resetForm();
            fetchItem(id);
            
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: `Ошибка запроса изменений: ${err.response?.data?.error || err.message}`,
                severity: 'error'
            });
            console.error('Error requesting changes:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setReason('');
        setComment('');
    };

    const openRejectDialog = () => {
        setRejectDialogOpen(true);
    };

    const openChangesDialog = () => {
        setChangesDialogOpen(true);
    };

    const closeRejectDialog = () => {
        setRejectDialogOpen(false);
        resetForm();
    };

    const closeChangesDialog = () => {
        setChangesDialogOpen(false);
        resetForm();
    };

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
    <div className="item-block">
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
            <Button variant="outlined" color="success" onClick={handleApprove}>
                Одобрить
            </Button>
            <Button variant="outlined" color="error" onClick={openRejectDialog}>
                Отклонить
            </Button>
            <Button variant="outlined" color="warning" onClick={openChangesDialog}>
                Доработка
            </Button>
        </div>
        <Dialog open={rejectDialogOpen} onClose={closeRejectDialog}>
            <DialogTitle>Отклонить объявление</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Причина отклонения</InputLabel>
                    <Select
                        value={reason}
                        label="Причина отклонения"
                        onChange={(e) => setReason(e.target.value)}
                    >
                        <MenuItem value="Запрещенный товар">Запрещенный товар</MenuItem>
                        <MenuItem value="Неверная категория">Неверная категория</MenuItem>
                        <MenuItem value="Некорректное описание">Некорректное описание</MenuItem>
                        <MenuItem value="Проблемы с фото">Проблемы с фото</MenuItem>
                        <MenuItem value="Подозрение на мошенничество">Подозрение на мошенничество</MenuItem>
                        <MenuItem value="Другое">Другое</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="Комментарий (необязательно)"
                    fullWidth
                    multiline
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={closeRejectDialog}>Отмена</Button>
                <Button 
                    onClick={handleReject} 
                    variant="contained" 
                    color="error"
                    disabled={!reason}
                >
                    Отклонить
                </Button>
            </DialogActions>
        </Dialog>

        <Dialog open={changesDialogOpen} onClose={closeChangesDialog}>
            <DialogTitle>Запросить доработку</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Причина доработки</InputLabel>
                    <Select
                        value={reason}
                        label="Причина доработки"
                        onChange={(e) => setReason(e.target.value)}
                    >
                        <MenuItem value="Запрещенный товар">Запрещенный товар</MenuItem>
                        <MenuItem value="Неверная категория">Неверная категория</MenuItem>
                        <MenuItem value="Некорректное описание">Некорректное описание</MenuItem>
                        <MenuItem value="Проблемы с фото">Проблемы с фото</MenuItem>
                        <MenuItem value="Подозрение на мошенничество">Подозрение на мошенничество</MenuItem>
                        <MenuItem value="Другое">Другое</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="Комментарий (необязательно)"
                    fullWidth
                    multiline
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={closeChangesDialog}>Отмена</Button>
                <Button 
                    onClick={handleRequestChanges} 
                    variant="contained" 
                    color="warning"
                    disabled={!reason}
                >
                    Запросить изменения
                </Button>
            </DialogActions>
        </Dialog>


        <Snackbar 
            open={snackbar.open} 
            autoHideDuration={4000} 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
            <Alert 
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                {snackbar.message}
            </Alert>
        </Snackbar>
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
    </div>
    )
}