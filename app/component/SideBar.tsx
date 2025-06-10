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
    styled,
    alpha,
    Tooltip
} from '@mui/material';
import {
    Dashboard,
    ExitToApp,
    Notifications as NotificationsIcon,
    ExpandLess,
    ExpandMore,
    Menu as MenuIcon,
    Brightness4,
    Brightness7
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

interface NotificationApiResponse {
    data: {
        data: {
            content: Notification[];
        };
    };
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

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

    const fetchUnreadCount = async () => {
        try {
            const response = await apiService.get<{ data: number }>('/api/v1/notifications/unread-count');
            setUnreadCount(typeof response.data.data === 'number' ? response.data.data : 0);
        } catch (error) {
            setUnreadCount(0);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await apiService.get<NotificationApiResponse>('/api/v1/notifications');
            const notificationsArr = response.data?.data?.data?.content;
            if (Array.isArray(notificationsArr)) {
                setNotifications(notificationsArr);
            }
        } catch (error) {
            setNotifications([]);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
    }, []);

    useWebSocket((notification: Notification) => {
        // Lấy thông tin user từ localStorage
        const userInfo = JSON.parse(localStorage.getItem('info') || '{}');
        
        // Chỉ cập nhật nếu thông báo dành cho user hiện tại
        if (notification.username === userInfo.username) {
            setNotifications((prevNotifications) => {
                const isNotificationExists = prevNotifications.some(
                    (existingNotification) => existingNotification.id === notification.id
                );
                if (!isNotificationExists) {
                    // Không tăng unreadCount ở đây nữa, sẽ để fetchUnreadCount xử lý
                    return [notification, ...prevNotifications];
                }
                return prevNotifications;
            });
            // Gọi fetchUnreadCount để cập nhật số lượng thông báo chưa đọc từ server
            fetchUnreadCount();
        }
    });

    const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
        fetchNotifications();
        setNotificationAnchor(event.currentTarget);
        fetchUnreadCount();
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
        fetchUnreadCount();
    };

    const handleExpandNotification = async (id: string) => {
        setExpandedNotificationId(id === expandedNotificationId ? null : id);
        const notification = notifications.find(n => n.id === id);
        if (notification && notification.status === 'UNREAD') {
            try {
                await apiService.patch(`/api/v1/notifications/${id}/mark-read`);
                fetchNotifications();
                fetchUnreadCount();
            } catch (error) {}
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await apiService.patch('/api/v1/notifications/mark-all-read');
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {}
    };

    useEffect(() => {
        sessionStorage.setItem("selectedIndex", selectedIndex.toString());
        if(menuItems[selectedIndex].text === "Đăng xuất"){
            logout();
        }
    }, [selectedIndex]);

    const handleListItemClick = (index: number) => {
        setSelectedIndex(index);
    };

    const handleToggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    const handleDashboardClick = () => setOpenDashboard(!openDashboard);
    const handleInventoryClick = () => setOpenInventory(!openInventory);
    const handleBusinessClick = () => setOpenBusiness(!openBusiness);

    const menuItems = [
        {
            text: "Thống kê",
            icon: <Dashboard />,
            path: "",
            subItems: [
                {
                    text: "Người dùng",
                    icon: <PersonIcon />,
                    path: "/user_dashboard"
                },
                {
                    text: "Mượn trả",
                    icon: <AttachMoneyIcon />,
                    path: "/loan_dashboard"
                },
                {
                    text: "Sách",
                    icon: <StackedBarChartIcon />,
                    path: "/book_dashboard"
                }
            ]
        },
        {
            text: "Kho sách",
            icon: <AutoStoriesIcon />,
            path: "",
            subItems: [
                {
                    text: "Thêm sách",
                    icon: <AddIcon />,
                    path: "/addbook"
                },
                {
                    text: "Quản lý sách",
                    icon: <LibraryBooksIcon />,
                    path: "/book-manage"
                }
            ]
        },
        {
            text: "Quản lý",
            icon: <ManageAccountsIcon />,
            path: "",
            subItems: [
                {
                    text: "Quản lý mượn trả",
                    icon: <ManageAccountsIcon />,
                    path: "/loan-manager"
                },
                {
                    text: "Bản đồ thư viện",
                    icon: <MapIcon />,
                    path: "/map"
                }
            ]
        },
        {
            text: "Đăng xuất",
            icon: <ExitToApp />,
            onclick: logout
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
                                    item.text === "Thống kê" ? handleDashboardClick() :
                                    item.text === "Kho sách" ? handleInventoryClick() : handleBusinessClick();
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
                                (item.text === "Thống kê" ? openDashboard : item.text === "Kho sách" ? openInventory : openBusiness)
                                ? <ExpandLess /> : <ExpandMore />
                            )}
                        </ListItemButton>

                        {item.subItems && (
                            <Collapse in={(item.text === "Thống kê" && openDashboard) || (item.text === "Kho sách" && openInventory) || (item.text === "Quản lý" && openBusiness)} timeout="auto" unmountOnExit>
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
                {isExpanded && <Typography variant="subtitle1">{fullName || 'Chưa có tên'}</Typography>}
                <Tooltip title="Thông báo">
                    <IconButton
                        onClick={handleNotificationClick}
                        sx={{ color: textColor }}
                    >
                        <StyledBadge badgeContent={unreadCount} max={99}>
                            <NotificationsIcon />
                        </StyledBadge>
                    </IconButton>
                </Tooltip>

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
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        sx: {
                            width: 400,
                            maxHeight: 500,
                            borderRadius: 3,
                            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
                            overflow: 'hidden',
                        },
                    }}
                >
                    <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                        <Typography variant="h6">Thông báo</Typography>
                    </Box>
                    <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
                        {notifications.length > 0 ? (
                            <List>
                                {notifications.map((notification) => (
                                    <React.Fragment key={notification.id}>
                                        <ListItem disablePadding>
                                            <ListItemButton 
                                                onClick={() => handleExpandNotification(notification.id)}
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: alpha('#1976d2', 0.1),
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography 
                                                            fontWeight={notification.status === 'UNREAD' ? 600 : 400}
                                                            sx={{ 
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    color: 'primary.main'
                                                                }
                                                            }}
                                                        >
                                                            {notification.title}
                                                        </Typography>
                                                    }
                                                    secondary={dayjs(notification.createdAt).format('DD/MM/YYYY HH:mm')}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                        {expandedNotificationId === notification.id && (
                                            <Box sx={{ px: 3, py: 1, bgcolor: alpha('#1976d2', 0.05) }}>
                                                <Typography variant="body2">
                                                    {notification.content}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Divider sx={{ my: 0.5 }} />
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Chưa có thông báo nào
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ p: 1.5, textAlign: 'center', borderTop: `1px solid #e0e0e0` }}>
                        <Typography
                            variant="body2"
                            color="secondary"
                            sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                            onClick={handleMarkAllRead}
                        >
                            Đánh dấu đã đọc tất cả
                        </Typography>
                    </Box>
                </Popover>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
