import axios from "axios";
import { useState , useEffect} from "react";
import { useParams } from "react-router-dom"

export default function Item(){
    const {id} = useParams();
    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState([]);
    const [error, setError] = useState('');
    const fetchItem = async () => {
        try{
            const response = axios.get('http://localhost:3001/api/v1/ads/' + id);
            setInfo((await response).data);
        }
        catch (err){
            setError('Ошибка загрузки объявления');
            console.error('Error fetching ads:', err);
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchItem();
      }, []);
    
      if (loading) return <div className="loading">Загрузка объявлений...</div>;
      if (error) return <div className="error">{error}</div>;

    return (
    <>

    </>
    )
}