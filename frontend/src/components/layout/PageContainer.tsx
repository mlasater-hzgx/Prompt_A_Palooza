import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface PageContainerProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageContainer({ title, actions, children }: PageContainerProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h1" component="h1">
          {title}
        </Typography>
        {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
      </Box>
      {children}
    </Box>
  );
}
