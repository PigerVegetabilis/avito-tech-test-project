import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';
import './Stats.css';

// Цвета для графиков
const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4'];

// Типы данных согласно вашей схеме
interface StatsSummary {
  totalReviewed: number;
  totalReviewedToday: number;
  totalReviewedThisWeek: number;
  totalReviewedThisMonth: number;
  approvedPercentage: number;
  rejectedPercentage: number;
  requestChangesPercentage: number;
  averageReviewTime: number;
}

interface ActivityData {
  date: string;
  approved: number;
  rejected: number;
  requestChanges: number;
}

interface DecisionsData {
  approved: number;
  rejected: number;
  requestChanges: number;
}

interface CategoryData {
  [category: string]: number;
}

interface ModeratorStats {
  totalReviewed: number;
  todayReviewed: number;
  thisWeekReviewed: number;
  thisMonthReviewed: number;
  averageReviewTime: number;
  approvalRate: number;
}

interface Moderator {
  id: number;
  name: string;
  email: string;
  role: string;
  statistics: ModeratorStats;
  permissions: string[];
}

const Stats = () => {
  const theme = useTheme();
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для данных
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [activity, setActivity] = useState<ActivityData[]>([]);
  const [decisions, setDecisions] = useState<DecisionsData | null>(null);
  const [categories, setCategories] = useState<CategoryData>({});
  const [moderator, setModerator] = useState<Moderator | null>(null);

  // Функции для загрузки данных
  const fetchSummary = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/v1/stats/summary?period=${period}`);
      return response.data;
    } catch (err) {
      throw new Error('Ошибка загрузки общей статистики');
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/v1/stats/chart/activity?period=${period}`);
      return response.data;
    } catch (err) {
      throw new Error('Ошибка загрузки данных активности');
    }
  };

  const fetchDecisions = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/v1/stats/chart/decisions?period=${period}`);
      return response.data;
    } catch (err) {
      throw new Error('Ошибка загрузки данных решений');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/v1/stats/chart/categories?period=${period}`);
      return response.data;
    } catch (err) {
      throw new Error('Ошибка загрузки данных по категориям');
    }
  };

  const fetchModerator = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/v1/moderators/me');
      return response.data;
    } catch (err) {
      throw new Error('Ошибка загрузки информации о модераторе');
    }
  };

  // Основная функция загрузки данных
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, activityData, decisionsData, categoriesData, moderatorData] = await Promise.all([
        fetchSummary(),
        fetchActivity(),
        fetchDecisions(),
        fetchCategories(),
        fetchModerator()
      ]);

      setSummary(summaryData);
      setActivity(activityData);
      setDecisions(decisionsData);
      setCategories(categoriesData);
      setModerator(moderatorData);

    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  // Преобразование данных для графиков
  const formattedActivity = activity.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    }),
    total: item.approved + item.rejected + item.requestChanges
  }));

  const decisionsChartData = decisions ? [
    { name: 'Одобрено', value: decisions.approved },
    { name: 'Отклонено', value: decisions.rejected },
    { name: 'На доработку', value: decisions.requestChanges }
  ] : [];

  const categoriesChartData = Object.entries(categories).map(([category, count]) => ({
    category,
    count
  })).sort((a, b) => b.count - a.count);

  if (loading) {
    return (
      <Box className="stats-container">
        <Box className="loading-container">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Загрузка статистики...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="stats-container">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchStats}>
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box className="stats-container">
      {/* Заголовок и фильтр */}
      <Box className="stats-header">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Статистика модератора
          </Typography>
          {moderator && (
            <Typography variant="subtitle1" color="textSecondary">
              {moderator.name} • {moderator.email} • {moderator.role}
            </Typography>
          )}
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Период</InputLabel>
          <Select
            value={period}
            label="Период"
            onChange={(e) => setPeriod(e.target.value)}
          >
            <MenuItem value="today">Сегодня</MenuItem>
            <MenuItem value="week">Неделя</MenuItem>
            <MenuItem value="month">Месяц</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Карточки с метриками */}
      {summary && (
        <Grid container spacing={3} className="metrics-grid">
          <Grid item xs={12} sm={6} md={3}>
            <Card className="metric-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Проверено сегодня
                </Typography>
                <Typography variant="h4" component="div" className="metric-value">
                  {summary.totalReviewedToday}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Всего: {summary.totalReviewedThisWeek} за неделю
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="metric-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Одобрено
                </Typography>
                <Typography variant="h4" component="div" className="metric-value approved">
                  {summary.approvedPercentage.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Отклонено: {summary.rejectedPercentage.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="metric-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Среднее время
                </Typography>
                <Typography variant="h4" component="div" className="metric-value">
                  {summary.averageReviewTime} сек
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  на объявление
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="metric-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Всего проверено
                </Typography>
                <Typography variant="h4" component="div" className="metric-value">
                  {summary.totalReviewed}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  за всё время
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Статистика модератора */}
      {moderator?.statistics && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Личная статистика
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Проверено мной
                  </Typography>
                  <Typography variant="h6">
                    {moderator.statistics.totalReviewed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Мой рейтинг одобрения
                  </Typography>
                  <Typography variant="h6" className="metric-value approved">
                    {moderator.statistics.approvalRate.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Мое среднее время
                  </Typography>
                  <Typography variant="h6">
                    {moderator.statistics.averageReviewTime} сек
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Сегодня проверено
                  </Typography>
                  <Typography variant="h6">
                    {moderator.statistics.todayReviewed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Графики */}
      <Grid container spacing={3} className="charts-grid">
        {/* График активности */}
        <Grid item xs={12} lg={8}>
          <Card className="chart-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Активность по дням
              </Typography>
              {activity.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formattedActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approved" name="Одобрено" fill="#10b981" />
                    <Bar dataKey="rejected" name="Отклонено" fill="#ef4444" />
                    <Bar dataKey="requestChanges" name="На доработку" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary" textAlign="center" py={6}>
                  Нет данных за выбранный период
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Круговая диаграмма решений */}
        <Grid item xs={12} lg={4}>
          <Card className="chart-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Распределение решений
              </Typography>
              {decisionsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={decisionsChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {decisionsChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary" textAlign="center" py={6}>
                  Нет данных о решениях
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* График по категориям */}
        <Grid item xs={12}>
          <Card className="chart-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Распределение по категориям
              </Typography>
              {categoriesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoriesChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Количество объявлений" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary" textAlign="center" py={6}>
                  Нет данных по категориям
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Stats;