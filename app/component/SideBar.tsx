import React, { useEffect, useState } from 'react';
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Box,
    Typography,
    IconButton,
    Drawer
} from '@mui/material';
import {
    Dashboard,
    Money,
    ExitToApp,
    Notifications,
    ExpandLess,
    ExpandMore,
    Menu as MenuIcon
} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MapIcon from '@mui/icons-material/Map';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

import { useAuth } from './Context/AuthContext';
import { useThemeContext } from './Context/ThemeContext';

const Sidebar: React.FC = () => {
    const { mode } = useThemeContext(); // Truy cập theme mode từ ThemeContext
    const [openDashboard, setOpenDashboard] = useState(false);
    const [openInventory, setOpenInventory] = useState(false);
    const [openBusiness, setOpenBusiness] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState<number>(() => {
        return parseInt(sessionStorage.getItem("selectedIndex") ?? "0");
    });
    const [fullName, setFullName] = useState("");

    const { logout } = useAuth();

    useEffect(() => {
        const storedFullname = sessionStorage.getItem('fullname');
        if (storedFullname) {
            setFullName(storedFullname);
        }
    }, []);
    useEffect(() => {
        sessionStorage.setItem("selectedIndex", selectedIndex.toString());
    }, [selectedIndex]);
    const handleListItemClick = (index: number, path: string) => {
        setSelectedIndex(index);
    };

    const handleToggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    const handleDashboardClick = () => setOpenDashboard(!openDashboard);
    const handleInventoryClick = () => setOpenInventory(!openInventory);
    const handleBusinessClick = () => setOpenBusiness(!openBusiness);

    const handleLogoutClick = () => {
        logout();
    };

    const menuItems = [
        {
            text: "Dashboard",
            icon: <Dashboard />, 
            path: "",
            subItems: [
                {
                    text: "New User",
                    icon: <PersonIcon />,
                    path: "/dashboard"
                },
                {
                    text: "Fines Manage",
                    icon: <AttachMoneyIcon />,
                    path: "/book-manage"
                },
                {
                    text: "Top Book",
                    icon: <StackedBarChartIcon />,
                    path: "/book-manage"
                }
            ]
        },
        {
            text: "Inventory",
            icon: <AutoStoriesIcon />,
            path: "",
            subItems: [
                {
                    text: "Add Book",
                    icon: <AddIcon />,
                    path: "/addbook"
                },
                {
                    text: "Books Management",
                    icon: <LibraryBooksIcon />,
                    path: "/book-manage"
                }
            ]
        },
        {
            text: "Manager",
            icon: <ManageAccountsIcon />,
            path: "",
            subItems: [
                {
                    text: "Manager",
                    icon: <ManageAccountsIcon />,
                    path: "/loan-manager"
                },
                {
                    text: "Library map",
                    icon: <MapIcon />,
                    path: "/map"
                }
            ]
        },
        {
            text: "Logout",
            icon: <ExitToApp />,
            path: "/logout"
        }
    ];

    const backgroundColor = mode === 'light' ? '#ffffff' : '#222428';
    const textColor = mode === 'light' ? '#000000' : '#ffffff';
    const hoverColor = mode === 'light' ? '#e0e0e0' : '#333333';

    return (
        <Drawer
            variant="permanent"
            open={isExpanded}
            sx={{
                zIndex: 1000,
                width: isExpanded ? 240 : 60,
                transition: "width 0.3s",
                "& .MuiDrawer-paper": {
                    width: isExpanded ? 240 : 60,
                    overflowX: "hidden",
                    boxSizing: 'border-box',
                    backgroundColor: backgroundColor,
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                    height: "65px",
                    backgroundColor: backgroundColor,
                }}
            >
                {isExpanded && (
                    <Typography variant="h6" component="a" href='/home' sx={{ ml: 1, color: textColor }} >
                        LibHub
                    </Typography>
                )}
                <IconButton
                    edge="start"
                    aria-label="menu"
                    onClick={handleToggleSidebar}
                    sx={{ justifyContent: isExpanded ? "flex-start" : "center", margin: isExpanded ? 0 : "auto", color: textColor }}
                >
                    <MenuIcon />
                </IconButton>
            </Box>

            <List sx={{ padding: "0 10px" }}>
                {menuItems.map((item, index) => (
                    item.text === "Logout" ? (
                        <ListItemButton
                            key={item.text}
                            onClick={handleLogoutClick}
                            sx={{
                                backgroundColor: selectedIndex === index ? "#204A9C" : "transparent",
                                color: selectedIndex === index ? "white" : textColor,
                                borderRadius: "8px",
                                margin: "5px 0 0 0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: isExpanded ? "flex-start" : "center",
                                "&:hover": {
                                    backgroundColor: hoverColor,
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: selectedIndex === index ? "white" : textColor,
                                    minWidth: 40,
                                    justifyContent: "center",
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            {isExpanded && (
                                <ListItemText primary={item.text} />
                            )}
                        </ListItemButton>
                    ) : (
                        item.subItems ? (
                            <div key={item.text}>
                                <ListItemButton
                                    onClick={() => {
                                        setSelectedIndex(index);
                                        item.text === "Dashboard" ? handleDashboardClick() :
                                        item.text === "Inventory" ? handleInventoryClick() : handleBusinessClick();
                                    }}
                                    sx={{
                                        backgroundColor: selectedIndex === index ? "#204A9C" : "transparent",
                                        color: selectedIndex === index ? "white" : textColor,
                                        borderRadius: "8px",
                                        margin: "5px 0 0 0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: isExpanded ? "flex-start" : "center",
                                        "&:hover": {
                                            backgroundColor: hoverColor,
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: selectedIndex === index ? "white" : textColor,
                                            minWidth: 40,
                                            justifyContent: "center",
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    {isExpanded && (
                                        <ListItemText primary={item.text} />
                                    )}
                                    {isExpanded && (
                                        item.text === "Dashboard" ? (openDashboard ? <ExpandLess /> : <ExpandMore />) :
                                        item.text === "Inventory" ? (openInventory ? <ExpandLess /> : <ExpandMore />) :
                                        (openBusiness ? <ExpandLess /> : <ExpandMore />)
                                    )}
                                </ListItemButton>
                                <Collapse in={(item.text === "Dashboard" && openDashboard) || (item.text === "Inventory" && openInventory) || (item.text === "Manager" && openBusiness)} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.subItems.map((subItem) => (
                                            <ListItemButton
                                                key={subItem.text}
                                                component="a"
                                                href={subItem.path}
                                                sx={{
                                                    paddingLeft: isExpanded ? 4 : 0,
                                                    backgroundColor: "transparent",
                                                    color: textColor,
                                                    "&:hover": {
                                                        backgroundColor: hoverColor,
                                                    },
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <ListItemIcon
                                                    sx={{
                                                        color: textColor,
                                                        minWidth: isExpanded ? 40 : 24,
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    {subItem.icon}
                                                </ListItemIcon>
                                                {isExpanded && (
                                                    <ListItemText primary={subItem.text} />
                                                )}
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            </div>
                        ) : (
                            <ListItemButton
                                key={item.text}
                                onClick={() => handleListItemClick(index, item.path)}
                                component="a"
                                href={item.path}
                                sx={{
                                    backgroundColor: selectedIndex === index ? "#204A9C" : "transparent",
                                    color: selectedIndex === index ? "white" : textColor,
                                    borderRadius: "8px",
                                    margin: "5px 0 0 0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: isExpanded ? "flex-start" : "center",
                                    "&:hover": {
                                        backgroundColor: hoverColor,
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: selectedIndex === index ? "white" : textColor,
                                        minWidth: 40,
                                        justifyContent: "center",
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {isExpanded && (
                                    <ListItemText primary={item.text} />
                                )}
                            </ListItemButton>
                        )
                    )
                ))}
            </List>

            <Box
                sx={{
                    mt: 'auto',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isExpanded ? 'space-between' : 'center', 
                    padding: isExpanded ? '0 16px' : '0', 
                    color: textColor,
                }}
            >
                {isExpanded && (
                    <Typography variant="subtitle1">
                        {fullName === "" ? 'No Name' : fullName}
                    </Typography>
                )}
                <IconButton
                    edge="end"
                    aria-label="notifications"
                    sx={{
                        color: textColor,
                        margin: 0, 
                        padding: 0, 
                        alignSelf: 'center',
                    }}
                >
                    <NotificationsIcon />
                </IconButton>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
