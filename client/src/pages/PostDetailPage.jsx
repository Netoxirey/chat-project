import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Edit, Delete, Send, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { fetchPostById, deletePost, clearError } from '../store/slices/postsSlice'
import { fetchComments, createComment, deleteComment } from '../store/slices/commentsSlice'
import { useAuth } from '../hooks/useAuth'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { commentSchema } from '../schemas/validationSchemas'

const PostDetailPage = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useAuth()
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [_editingComment, setEditingComment] = useState(null)

  const { currentPost, isLoading: postLoading, error: postError } = useSelector((state) => state.posts)
  const { comments, isLoading: commentsLoading, error: commentsError } = useSelector((state) => state.comments)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(commentSchema),
  })

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId))
      dispatch(fetchComments(postId))
    }
  }, [dispatch, postId])

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await dispatch(deletePost(postId)).unwrap()
        navigate('/')
      } catch {
        // Error is handled by Redux
      }
    }
  }

  const handleCommentSubmit = async (data) => {
    try {
      await dispatch(createComment({ postId, commentData: data })).unwrap()
      reset()
      setShowCommentForm(false)
    } catch {
      // Error is handled by Redux
    }
  }

  const handleCommentDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await dispatch(deleteComment({ postId, commentId })).unwrap()
      } catch {
        // Error is handled by Redux
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (postLoading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (postError) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>
          {postError}
        </Alert>
        <Button onClick={() => dispatch(clearError())} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Container>
    )
  }

  if (!currentPost) {
    return (
      <Container maxWidth="md">
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Post not found
        </Typography>
      </Container>
    )
  }

  const isAuthor = user && currentPost.author?.id === user.id

  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {currentPost.title}
            </Typography>
            {isAuthenticated && isAuthor && (
              <Box>
                <Button
                  startIcon={<Edit />}
                  onClick={() => navigate(`/posts/${postId}/edit`)}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button
                  startIcon={<Delete />}
                  color="error"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </Box>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            By {currentPost.author?.firstName} {currentPost.author?.lastName} on{' '}
            {formatDate(currentPost.createdAt)}
          </Typography>

          {currentPost.tags && (
            <Box sx={{ mb: 2 }}>
              {currentPost.tags.split(',').map((tag, index) => (
                <Chip
                  key={index}
                  label={tag.trim()}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" paragraph>
            {currentPost.content}
          </Typography>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Comments ({comments.length})
          </Typography>

          {isAuthenticated && (
            <Box sx={{ mb: 3 }}>
              {!showCommentForm ? (
                <Button
                  variant="outlined"
                  onClick={() => setShowCommentForm(true)}
                >
                  Add Comment
                </Button>
              ) : (
                <Box component="form" onSubmit={handleSubmit(handleCommentSubmit)}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Write your comment..."
                    {...register('content')}
                    error={!!errors.content}
                    helperText={errors.content?.message}
                    sx={{ mb: 2 }}
                  />
                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Send />}
                      sx={{ mr: 1 }}
                    >
                      Post Comment
                    </Button>
                    <Button
                      onClick={() => {
                        setShowCommentForm(false)
                        reset()
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {commentsLoading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : commentsError ? (
            <Alert severity="error">{commentsError}</Alert>
          ) : (
            <Box>
              {comments.map((comment) => (
                <Box key={comment.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle2" color="primary">
                      {comment.author?.firstName} {comment.author?.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(comment.createdAt)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    {comment.content}
                  </Typography>
                  {isAuthenticated && user && comment.author?.id === user.id && (
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => setEditingComment(comment)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleCommentDelete(comment.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

export default PostDetailPage
