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
    Drawer,
    Popover,
    ListItem,
    Divider,
    Badge,
} from '@mui/material';
import {
    Dashboard,
    ExitToApp,
    Notifications as NotificationsIcon,
    ExpandLess,
    ExpandMore,
    Menu as MenuIcon,
} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import PersonIcon from '@mui/icons-material/Person';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MapIcon from '@mui/icons-material/Map';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useAuth } from './Context/AuthContext';
import { useThemeContext } from './Context/ThemeContext';
import apiService from '../untils/api';
import dayjs from 'dayjs';
import useWebSocket from '../services/useWebSocket';

interface Notification {
    id: string;
    username: string;
    title: string;
    content: string;
    createdAt: string;
    status: string;
    groupName: string | null;
}

interface ApiResponse {
    data: {
        result: {
            content: Notification[];
        };
    };
}

interface Res {
    code: number;
    message: string;
    result: number;
}

const Sidebar: React.FC = () => {
    const { mode } = useThemeContext();
    const { logout } = useAuth();

    const [openDashboard, setOpenDashboard] = useState(false);
    const [openInventory, setOpenInventory] = useState(false);
    const [openBusiness, setOpenBusiness] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number>(() => {
        return parseInt(sessionStorage.getItem("selectedIndex") ?? "0");
    });
    const [fullName, setFullName] = useState("");
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
    const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);

    useEffect(() => {
        const storedFullname = sessionStorage.getItem('fullname');
        if (storedFullname) {
            setFullName(storedFullname);
        }
    }, []);
    useWebSocket((notification: Notification) => {
        console.log('New notification', notification.username);
        console.log('fullname', fullName);
    
        setNotifications((prevNotifications) => {
            // Kiểm tra nếu thông báo đã tồn tại trong danh sách dựa trên id
            const isNotificationExists = prevNotifications.some(
                (existingNotification) => existingNotification.id === notification.id
            );
            console.log('isnotifi',isNotificationExists);
            console.log('prenotifi',prevNotifications);
            console.log('new noti',notification);
            
    
            // Nếu thông báo chưa tồn tại và thuộc về bản thân (so sánh với fullName)
            if (notification.username === fullName.toLowerCase() && !isNotificationExists) {
                console.log('Thông báo mới, chưa tồn tại trong danh sách');
                fetchUnreadNotifications();
                return [notification, ...prevNotifications]; // Thêm notification vào danh sách
            }
    
            // Nếu thông báo đã tồn tại hoặc không phải của bản thân, không làm gì
            console.log('Thông báo đã tồn tại hoặc không phải của bản thân');
            return prevNotifications;
        });
    });
    
    
    const fetchUnreadNotifications = async () => {
        try {
            const response = await apiService.get<Res>('/api/v1/notifications/unread-count');
            setUnreadCount(response.data.result);
        } catch (error) {
            console.log('Failed to fetch unread notifications:', error);
        }
    };

    

    useEffect(() => {
        fetchUnreadNotifications();
    }, []);

    useEffect(() => {
        sessionStorage.setItem("selectedIndex", selectedIndex.toString());
    }, [selectedIndex]);

    const handleListItemClick = (index: number) => {
        setSelectedIndex(index);
    };

    const handleToggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    const handleNotificationClick = async (event: React.MouseEvent<HTMLElement>) => {
        setNotificationAnchor(event.currentTarget);
        try {
            const response: ApiResponse = await apiService.get('/api/v1/notifications/my-notifications');
            console.log(response)
            setNotifications(response.data.result.content);
        } catch (error) {
            console.log('Failed to fetch notifications:', error);
        }
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const handleExpandNotification = (id: string) => {
        setExpandedNotificationId(id === expandedNotificationId ? null : id);
    };

    const handleDashboardClick = () => setOpenDashboard(!openDashboard);
    const handleInventoryClick = () => setOpenInventory(!openInventory);
    const handleBusinessClick = () => setOpenBusiness(!openBusiness);

    const menuItems = [
        {
            text: "Dashboard",
            icon: <Dashboard />,
            path: "",
            subItems: [
                {
                    text: "User",
                    icon: <PersonIcon />,
                    path: "/user_dashboard"
                },
                {
                    text: "Loan",
                    icon: <AttachMoneyIcon />,
                    path: "/loan_dashboard"
                },
                {
                    text: "Book",
                    icon: <StackedBarChartIcon />,
                    path: "/book_dashboard"
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
                    <Typography variant="h6" component="a" href='/home' sx={{ ml: 1, color: textColor }}>
                        LibHub
                    </Typography>
                )}
                <IconButton
                    edge="start"
                    aria-label="menu"
                    onClick={handleToggleSidebar}
                    sx={{ justifyContent: isExpanded ? "flex-start" : "center", margin: isExpanded ? 0 : "auto" }}
                >
                    <MenuIcon />
                </IconButton>
            </Box>

            <List sx={{ padding: "0 10px" }}>
                {menuItems.map((item, index) => (
                    <div key={item.text}>
                        <ListItemButton
                            onClick={() => {
                                setSelectedIndex(index);
                                if (item.subItems) {
                                    item.text === "Dashboard" ? handleDashboardClick() :
                                    item.text === "Inventory" ? handleInventoryClick() : handleBusinessClick();
                                }
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
                            {isExpanded && item.subItems && (
                                (item.text === "Dashboard" ? openDashboard : item.text === "Inventory" ? openInventory : openBusiness)
                                ? <ExpandLess /> : <ExpandMore />
                            )}
                        </ListItemButton>

                        {item.subItems && (
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
                        )}
                    </div>
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
                {isExpanded && <Typography variant="subtitle1">{fullName || 'No Name'}</Typography>}
                <IconButton
                    edge="end"
                    aria-label="notifications"
                    onClick={handleNotificationClick}
                    sx={{
                        color: textColor,
                        margin: 0,
                        padding: 0,
                        position: 'relative',
                    }}
                >
                    <NotificationsIcon />
                    {unreadCount > 0 && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                backgroundColor: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                width: 18,
                                height: 18,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold',
                            }}
                        >
                            {unreadCount}
                        </Box>
                    )}
                </IconButton>

                <Popover
                    open={Boolean(notificationAnchor)}
                    anchorEl={notificationAnchor}
                    onClose={handleNotificationClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <Box p={2} width={300}>
                        <Typography variant="h6" gutterBottom>
                            Notifications
                        </Typography>
                        <List>
                            {notifications.map((notification) => (
                                <Box key={notification.id} mb={2}>
                                    <ListItem disablePadding>
                                        <ListItemButton onClick={() => handleExpandNotification(notification.id)}>
                                            {notification.status === 'UNREAD' && (
                                                <Box
                                                    sx={{
                                                        width: 10,
                                                        height: 10,
                                                        backgroundColor: '#99CCFF',
                                                        borderRadius: '50%',
                                                        marginRight: 1,
                                                    }}
                                                />
                                            )}
                                            <ListItemText
                                                primary={notification.title}
                                                secondary={dayjs(notification.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                    {expandedNotificationId === notification.id && (
                                        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                                            {notification.content}
                                        </Typography>
                                    )}
                                    <Divider sx={{ mt: 1, mb: 1 }} />
                                </Box>
                            ))}
                        </List>
                    </Box>
                </Popover>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
