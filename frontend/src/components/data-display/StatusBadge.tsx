import { Chip, type ChipProps } from '@mui/material';
import { colors } from '../../design-system/tokens/colors';

type StatusType = 'success' | 'error' | 'warning' | 'info' | 'default';

const STATUS_MAP: Record<string, StatusType> = {
  // Incident statuses
  REPORTED: 'info',
  UNDER_INVESTIGATION: 'warning',
  INVESTIGATION_COMPLETE: 'success',
  CAPA_ASSIGNED: 'warning',
  CAPA_IN_PROGRESS: 'warning',
  CLOSED: 'success',
  REOPENED: 'error',
  // Investigation statuses
  NOT_STARTED: 'default',
  IN_PROGRESS: 'warning',
  PENDING_REVIEW: 'info',
  COMPLETE: 'success',
  // CAPA statuses
  OPEN: 'info',
  COMPLETED: 'success',
  VERIFICATION_PENDING: 'warning',
  VERIFIED_EFFECTIVE: 'success',
  VERIFIED_INEFFECTIVE: 'error',
  OVERDUE: 'error',
};

const STYLE_MAP: Record<StatusType, { bg: string; color: string }> = {
  success: { bg: colors.semantic.successLight, color: colors.semantic.success },
  error: { bg: colors.semantic.errorLight, color: colors.semantic.error },
  warning: { bg: colors.semantic.warningLight, color: colors.semantic.warning },
  info: { bg: colors.semantic.infoLight, color: colors.semantic.info },
  default: { bg: colors.neutral.lightGray, color: colors.brand.darkGray },
};

interface StatusBadgeProps extends Omit<ChipProps, 'color'> {
  status: string;
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const type = STATUS_MAP[status] ?? 'default';
  const style = STYLE_MAP[type];
  const label = status.replace(/_/g, ' ');

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 600,
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        borderRadius: '3px',
        height: 'auto',
        py: '2px',
        px: '6px',
      }}
      {...props}
    />
  );
}
