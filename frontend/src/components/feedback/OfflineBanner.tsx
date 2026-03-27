import { Alert } from '@mui/material';
import { WifiOff as WifiOffIcon } from '@mui/icons-material';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <Alert
      severity="warning"
      icon={<WifiOffIcon />}
      sx={{
        borderRadius: 0,
        position: 'sticky',
        top: 0,
        zIndex: 1200,
      }}
    >
      You are offline. Changes will be saved locally and synced when you reconnect.
    </Alert>
  );
}
