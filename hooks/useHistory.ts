
import { useState, useEffect, useCallback } from 'react';
import { HistoryItem } from '../types';
import { getAllHistory, saveHistoryItem, deleteHistoryItem } from '../utils/indexedDB';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await getAllHistory();
        setHistory(savedHistory);
      } catch (e) {
        console.warn('无法加载历史记录:', e);
      }
    };
    loadHistory();
  }, []);

  // Save history when it changes
  useEffect(() => {
    const saveNewItem = async () => {
      if (history.length === 0) return;
      try {
        await saveHistoryItem(history[0] as any);
      } catch (e) {
        console.warn('无法保存历史记录:', e);
      }
    };
    saveNewItem();
  }, [history]);

  const deleteItem = useCallback(async (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    await deleteHistoryItem(id).catch(console.error);
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<HistoryItem>) => {
    setHistory(prev => prev.map(h => {
      if (h.id === id) {
        const updated = { ...h, ...updates };
        // Save to IndexedDB immediately
        saveHistoryItem(updated as any).catch(console.error);
        return updated;
      }
      return h;
    }));
  }, []);

  const addItem = useCallback((item: HistoryItem) => {
    setHistory(prev => [item, ...prev]);
  }, []);

  const importHistory = useCallback((items: HistoryItem[]) => {
    setHistory(prev => {
      const combined = [...items, ...prev];
      const unique = combined.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) return acc.concat([current]);
        return acc;
      }, [] as HistoryItem[]);
      return unique.sort((a, b) => b.timestamp - a.timestamp);
    });
  }, []);

  return {
    history,
    setHistory,
    deleteItem,
    addItem,
    importHistory,
    updateItem
  };
}
