import React, { useEffect, useState } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
} from '@mui/material';
import Sidebar from '../SideBar';
import AddIcon from '@mui/icons-material/Add';
import apiService from '../../untils/api';

interface Rack {
    rackId: number;
    rackNumber: string;
    capacity: number;
    shelfName: string;
}

interface Shelf {
    shelfId: number;
    shelfNumber: string;
    zoneName: string;
}

const LibraryMap = () => {
    const [shelves, setShelves] = useState<Shelf[]>([]);
    const [racks, setRacks] = useState<Rack[]>([]);
    const [openRackDialog, setOpenRackDialog] = useState(false);
    const [openShelfDialog, setOpenShelfDialog] = useState(false);
    const [newRack, setNewRack] = useState({ rackNumber: '', capacity: '', shelfId: '' });
    const [newShelf, setNewShelf] = useState({ shelfNumber: '', zoneId: '' });

    useEffect(() => {
        fetchShelves();
        fetchRacks();
    }, []);

    const fetchShelves = async () => {
        try {
            const response = await apiService.get<{ result: { content: Shelf[] } }>('/api/v1/shelves');
            setShelves(response.data.result.content);
        } catch (error) {
            console.error('Error fetching shelves:', error);
        }
    };

    const fetchRacks = async () => {
        try {
            const response = await apiService.get<{ result: { content: Rack[] } }>('/api/v1/racks');
            setRacks(response.data.result.content);
        } catch (error) {
            console.error('Error fetching racks:', error);
        }
    };

    const handleAddRack = async () => {
        try {
            await apiService.post('/api/v1/racks', {
                rackNumber: newRack.rackNumber,
                capacity: parseFloat(newRack.capacity),
                shelfId: parseInt(newRack.shelfId),
            });
            alert('Rack added successfully!');
            setOpenRackDialog(false);
            setNewRack({ rackNumber: '', capacity: '', shelfId: '' });
            fetchRacks();
        } catch (error) {
            console.error('Error adding rack:', error);
            alert('Failed to add rack');
        }
    };

    const handleAddShelf = async () => {
        try {
            await apiService.post('/api/v1/shelves', {
                shelfNumber: newShelf.shelfNumber,
                zoneId: parseInt(newShelf.zoneId),
            });
            alert('Shelf added successfully!');
            setOpenShelfDialog(false);
            setNewShelf({ shelfNumber: '', zoneId: '' });
            fetchShelves();
        } catch (error) {
            console.error('Error adding shelf:', error);
            alert('Failed to add shelf');
        }
    };

    // Group racks by shelfName
    const groupedRacks = racks.reduce((acc: { [key: string]: Rack[] }, rack) => {
        acc[rack.shelfName] = acc[rack.shelfName] || [];
        acc[rack.shelfName].push(rack);
        return acc;
    }, {});

    return (
        <Box display="flex" height="100vh">
            <Sidebar />
            <Box flex={1} p={3} overflow="auto" height="100vh">
                <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Library Map
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Find this book at highlighted rack and shelf
                    </Typography>

                    {/* Render shelves and racks dynamically */}
                    <Grid container spacing={2} justifyContent="center" alignItems="flex-start" style={{ maxWidth: 600, margin: 'auto' }}>
                        {shelves.map((shelf) => (
                            <Grid item key={shelf.shelfId}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Shelf {shelf.shelfNumber} (Zone: {shelf.zoneName})
                                </Typography>
                                <Box display="flex" flexDirection="column" alignItems="center">
                                    {groupedRacks[shelf.shelfNumber]?.map((rack) => (
                                        <Paper
                                            key={rack.rackId}
                                            elevation={3}
                                            sx={{
                                                width: 50,
                                                height: 50,
                                                marginTop: 1,
                                                backgroundColor: 'orange',
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                                <Typography>{rack.rackNumber}</Typography>
                                            </Box>
                                        </Paper>
                                    ))}
                                    {/* Add rack button */}
                                    <Paper
                                        elevation={3}
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            marginTop: 1,
                                            backgroundColor: '#e0e0e0',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => {
                                            setNewRack({ ...newRack, shelfId: shelf.shelfId.toString() });
                                            setOpenRackDialog(true);
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                            <AddIcon />
                                        </Box>
                                    </Paper>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    {/* Add shelf button */}
                    <Box textAlign="right" mt={3}>
                        <Button variant="contained" color="primary" onClick={() => setOpenShelfDialog(true)}>
                            Add Shelf
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Dialog for adding rack */}
            <Dialog open={openRackDialog} onClose={() => setOpenRackDialog(false)}>
                <DialogTitle>Add Rack</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Rack Number"
                        type="text"
                        fullWidth
                        value={newRack.rackNumber}
                        onChange={(e) => setNewRack({ ...newRack, rackNumber: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Capacity"
                        type="number"
                        fullWidth
                        value={newRack.capacity}
                        onChange={(e) => setNewRack({ ...newRack, capacity: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRackDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddRack} color="primary" variant="contained">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog for adding shelf */}
            <Dialog open={openShelfDialog} onClose={() => setOpenShelfDialog(false)}>
                <DialogTitle>Add Shelf</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Shelf Number"
                        type="text"
                        fullWidth
                        value={newShelf.shelfNumber}
                        onChange={(e) => setNewShelf({ ...newShelf, shelfNumber: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Zone ID"
                        type="number"
                        fullWidth
                        value={newShelf.zoneId}
                        onChange={(e) => setNewShelf({ ...newShelf, zoneId: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenShelfDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddShelf} color="primary" variant="contained">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LibraryMap;
