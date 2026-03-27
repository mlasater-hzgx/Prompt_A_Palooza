import { Badge, IconButton, Tooltip } from '@mui/material';
import { Sync as SyncIcon } from '@mui/icons-material';
import { useSyncStore } from '../../store/sync.store';

export function SyncStatusIndicator() {
  const { pendingCount, isSyncing, lastSyncAt } = useSyncStore();

  if (pendingCount === 0 && !isSyncing) return null;

  const tooltip = isSyncing
    ? 'Syncing...'
    : `${pendingCount} pending changes${lastSyncAt ? `. Last sync: ${lastSyncAt.toLocaleTimeString()}` : ''}`;

  return (
    <Tooltip title={tooltip}>
      <IconButton aria-label={tooltip}>
        <Badge badgeContent={pendingCount} color="warning">
          <SyncIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
