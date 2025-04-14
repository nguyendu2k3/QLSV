import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box
} from '@mui/material';

const CreatePost = ({ open, onClose, onSubmit, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: categories[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      content: '',
      category: categories[0]
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Tạo bài viết mới</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Tiêu đề"
            type="text"
            fullWidth
            required
            value={formData.title}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="content"
            label="Nội dung"
            multiline
            rows={4}
            fullWidth
            required
            value={formData.content}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="category"
            select
            label="Danh mục"
            fullWidth
            required
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained">
            Đăng bài
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreatePost;