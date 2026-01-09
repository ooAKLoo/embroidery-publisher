import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

// FRED API Key - 用户需要在环境变量中配置
const FRED_API_KEY = import.meta.env.VITE_FRED_API_KEY || '';

export function useMarketData() {
  const [indicators, setIndicators] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 获取所有市场指标
  const fetchAllIndicators = useCallback(async () => {
    if (!FRED_API_KEY) {
      setError('请在 .env.local 中配置 VITE_FRED_API_KEY');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await invoke('fetch_market_indicators', {
        apiKey: FRED_API_KEY,
      });

      setIndicators(result.indicators || []);
      setSignals(result.signals || []);
      setLastUpdated(result.lastUpdated);
    } catch (err) {
      console.error('获取市场数据失败:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取缓存的数据
  const getCachedData = useCallback(async () => {
    try {
      const result = await invoke('get_cached_market_data');
      if (result.indicators?.length > 0) {
        setIndicators(result.indicators);
        setSignals(result.signals || []);
        setLastUpdated(result.lastUpdated);
        return true;
      }
      return false;
    } catch (err) {
      console.error('获取缓存失败:', err);
      return false;
    }
  }, []);

  // 获取单个指标详情
  const fetchSingleIndicator = useCallback(async (seriesId, limit = 60) => {
    if (!FRED_API_KEY) {
      throw new Error('请配置 FRED API Key');
    }

    try {
      const result = await invoke('fetch_single_indicator', {
        seriesId,
        apiKey: FRED_API_KEY,
        limit,
      });
      return result;
    } catch (err) {
      console.error(`获取指标 ${seriesId} 失败:`, err);
      throw err;
    }
  }, []);

  // 初始化时加载缓存数据
  useEffect(() => {
    getCachedData();
  }, [getCachedData]);

  // 获取特定指标
  const getIndicator = useCallback(
    (name) => {
      return indicators.find((i) => i.name === name);
    },
    [indicators]
  );

  // 获取触发的信号
  const getTriggeredSignals = useCallback(() => {
    return signals.filter((s) => s.triggered);
  }, [signals]);

  // 辅助函数：格式化趋势箭头
  const getTrendArrow = useCallback((trend) => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '—';
    }
  }, []);

  // 辅助函数：获取趋势颜色
  const getTrendColor = useCallback((trend, inverted = false) => {
    if (inverted) {
      switch (trend) {
        case 'up':
          return 'text-red-500';
        case 'down':
          return 'text-green-500';
        default:
          return 'text-gray-500';
      }
    }
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }, []);

  return {
    // 状态
    indicators,
    signals,
    loading,
    error,
    lastUpdated,
    hasApiKey: !!FRED_API_KEY,

    // 方法
    fetchAllIndicators,
    fetchSingleIndicator,
    getCachedData,
    getIndicator,
    getTriggeredSignals,

    // 辅助函数
    getTrendArrow,
    getTrendColor,
  };
}
