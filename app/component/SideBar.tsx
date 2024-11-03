// Sidebar.tsx
import React, { useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Collapse, ListItemButton, Box, Typography, IconButton } from '@mui/material';
import { Dashboard, Book, Money, ExitToApp, Notifications } from '@mui/icons-material';
import BookIcon from '@mui/icons-material/Book';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const Sidebar: React.FC = () => {
    const [openInventory, setOpenInventory] = useState(false);
    const [openBusiness, setOpenBusiness] = useState(false);

    const fullname = sessionStorage.getItem('fullname') || 'noname';

    const handleInventoryClick = () => setOpenInventory(!openInventory);
    const handleBusinessClick = () => setOpenBusiness(!openBusiness);

    return (
        <Box display="flex" flexDirection="column" height="100vh">
            <List component="nav" sx={{ flexGrow: 1 }}>
                <ListItemButton onClick={() => {}}>
                    <ListItemIcon><Dashboard /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>

                <ListItemButton onClick={handleInventoryClick}>
                    <ListItemIcon><AutoStoriesIcon /></ListItemIcon>
                    <ListItemText primary="Inventory" />
                    {openInventory ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openInventory} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton sx={{ paddingLeft: 4 }} href='/addbook'>
                            <ListItemText primary="Add Book" />
                        </ListItemButton>
                        <ListItemButton sx={{ paddingLeft: 4 }} onClick={() => {}} >
                            <ListItemText primary="Books Management" />
                        </ListItemButton>
                    </List>
                </Collapse>

                <ListItemButton onClick={handleBusinessClick}>
                    <ListItemIcon><Money /></ListItemIcon>
                    <ListItemText primary="Manager" />
                    {openBusiness ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openBusiness} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton sx={{ paddingLeft: 4 }} onClick={() => {}}>
                            <ListItemText primary="Books Loan" />
                        </ListItemButton>
                        <ListItemButton sx={{ paddingLeft: 4 }} onClick={() => {}}>
                            <ListItemText primary="Subscription" />
                        </ListItemButton>
                    </List>
                </Collapse>

                <ListItemButton onClick={() => {}}>
                    <ListItemIcon><ExitToApp /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </List>

            <Box display="flex" alignItems="center" justifyContent="space-between" p={2} bgcolor="#333" color="white">
                <Typography variant="body1">
                    {fullname}
                </Typography>
                <IconButton color="inherit" onClick={() => {  }}>
                    <Notifications />
                </IconButton>
            </Box>
        </Box>
    );
};

export default Sidebar;
