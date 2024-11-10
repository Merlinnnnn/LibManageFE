import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Button } from '@mui/material';
import { grey, orange } from '@mui/material/colors';
import BookStatistics from './BookDashBoard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const DashboardTabs: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <Tabs value={value} onChange={handleChange} aria-label="dashboard tabs">
        <Tab
          label="Time Analysis"
          sx={{
            bgcolor: grey[700],
            color: 'white',
            '&.Mui-selected': { bgcolor: grey[600] },
            borderRadius: '16px',
            marginRight: 1,
          }}
        />
        <Tab
          label="Detail Dashboard"
          sx={{
            bgcolor: grey[500],
            color: 'white',
            '&.Mui-selected': { bgcolor: grey[400] },
            borderRadius: '16px',
            marginRight: 1,
          }}
        />
        <Tab
          label="Clear Filters"
          sx={{
            bgcolor: orange[700],
            color: 'white',
            '&.Mui-selected': { bgcolor: orange[600] },
            borderRadius: '16px',
          }}
        />
      </Tabs>
      <TabPanel value={value} index={0}>
       
        <Typography variant="h5">Time Analysis Content</Typography>
        <BookStatistics/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        {/* Nội dung cho Detail Dashboard */}
        <Typography variant="h5">Detail Dashboard Content</Typography>
      </TabPanel>
      <TabPanel value={value} index={2}>
        {/* Nội dung cho Clear Filters */}
        <Typography variant="h5">Clear Filters Content</Typography>
        <Button variant="contained" color="error" onClick={() => setValue(0)}>
          Reset Filters
        </Button>
      </TabPanel>
    </Box>
  );
};

export default DashboardTabs;
