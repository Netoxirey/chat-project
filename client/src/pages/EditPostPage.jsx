import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useParams, useNavigate } from 'react-router-dom'
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
import { fetchPostById, updatePost, clearError } from '../store/slices/postsSlice'
import { postSchema } from '../schemas/validationSchemas'

const EditPostPage = () => {
  const { postId } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentPost, error } = useSelector((state) => state.posts)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(postSchema),
  })

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId))
    }
  }, [dispatch, postId])

  useEffect(() => {
    if (currentPost) {
      reset({
        title: currentPost.title,
        content: currentPost.content,
        tags: currentPost.tags || '',
      })
    }
  }, [currentPost, reset])

  const onSubmit = async (data) => {
    setIsLoading(true)
    dispatch(clearError())
    
    try {
      await dispatch(updatePost({ postId, postData: data })).unwrap()
      navigate(`/posts/${postId}`)
    } catch {
      // Error is handled by Redux
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentPost) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Post
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
              {isLoading ? <CircularProgress size={24} /> : 'Update Post'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => navigate(`/posts/${postId}`)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default EditPostPage
