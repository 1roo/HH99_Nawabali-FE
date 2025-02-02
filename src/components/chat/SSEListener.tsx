import { useEffect, useRef, useState } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Cookies } from 'react-cookie';
import useSSEStore from '@/store/SSEState';

const SSEListener: React.FC = () => {
  const cookie = new Cookies();
  const rawToken = cookie.get('accessToken');
  const decodedToken = decodeURIComponent(rawToken);
  const accessToken = decodedToken.startsWith('Bearer ')
    ? decodedToken.substring('Bearer '.length)
    : decodedToken;
  const [, setIsConnected] = useState<boolean>(false);

  const { setUnreadMessageCount } = useSSEStore((state) => ({
    setUnreadMessageCount: state.setUnreadMessageCount,
  }));

  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const retryInterval = useRef<number>(5000); // 초기 재시도 간격
  const maxInterval = 60000; // 최대 재시도 간격

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const setupSSEConnection = (): void => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      eventSourceRef.current = new EventSourcePolyfill(
        `${import.meta.env.VITE_APP_BASE_URL}/notification/subscribe`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          heartbeatTimeout: 60000,
          withCredentials: true,
        },
      );

      eventSourceRef.current.onopen = (): void => {
        setIsConnected(true);
        retryInterval.current = 5000; // 연결 성공 시 재시도 간격을 초기화
      };

      eventSourceRef.current.addEventListener(
        'unreadMessageCount',
        (event: any) => {
          const data = event.data;
          setUnreadMessageCount(data);
        },
      );

      eventSourceRef.current.onerror = (): void => {
        setIsConnected(false);
        eventSourceRef.current?.close();
        retryConnection();
      };
    };

    const retryConnection = (): void => {
      setTimeout(() => {
        if (retryInterval.current < maxInterval) {
          retryInterval.current *= 2;
        }
        setupSSEConnection();
      }, retryInterval.current);
    };

    setupSSEConnection();

    return (): void => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [accessToken]);

  return null;
};

export default SSEListener;
