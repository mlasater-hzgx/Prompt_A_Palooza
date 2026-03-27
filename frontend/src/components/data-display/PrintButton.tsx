import { Button } from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';

interface PrintButtonProps {
  label?: string;
}

export function PrintButton({ label = 'Print' }: PrintButtonProps) {
  return (
    <Button
      variant="outlined"
      startIcon={<PrintIcon />}
      onClick={() => window.print()}
      className="no-print"
      sx={{ minWidth: 100 }}
    >
      {label}
    </Button>
  );
}
