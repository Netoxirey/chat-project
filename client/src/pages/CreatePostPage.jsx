import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Save, Cancel } from '@mui/icons-material'
import { createPost, clearError } from '../store/slices/postsSlice'
import { postSchema } from '../schemas/validationSchemas'

const CreatePostPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { error } = useSelector((state) => state.posts)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(postSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    dispatch(clearError())
    
    try {
      await dispatch(createPost(data)).unwrap()
      navigate('/')
    } catch {
      // Error is handled by Redux
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Post
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            {...register('title')}
            error={!!errors.title}
            helperText={errors.title?.message}
          />
          
          <TextField
            fullWidth
            label="Content"
            multiline
            rows={10}
            margin="normal"
            {...register('content')}
            error={!!errors.content}
            helperText={errors.content?.message}
          />
          
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            margin="normal"
            placeholder="react, javascript, tutorial"
            {...register('tags')}
            error={!!errors.tags}
            helperText={errors.tags?.message}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Create Post'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default CreatePostPage
