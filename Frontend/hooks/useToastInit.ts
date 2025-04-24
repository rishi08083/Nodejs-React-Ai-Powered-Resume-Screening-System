import { useEffect } from 'react';
import toastService from '../utils/toastService';

export const useToastInit = () => {
  useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      toastService.checkPendingToasts();
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
};