import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  Grid,
} from '@mui/material'
import { Search, Add, Edit, Delete } from '@mui/icons-material'
import { fetchPosts, deletePost, clearError } from '../store/slices/postsSlice'
import { useAuth } from '../hooks/useAuth'

const PostListPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { posts, pagination, isLoading, error } = useSelector((state) => state.posts)

  useEffect(() => {
    dispatch(fetchPosts({ page, search: searchQuery }))
  }, [dispatch, page, searchQuery])

  const handleSearch = (event) => {
    setSearchQuery(event.target.value)
    setPage(1) // Reset to first page when searching
  }

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await dispatch(deletePost(postId)).unwrap()
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
    })
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => dispatch(clearError())} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Blog Posts
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/create-post')}
          >
            Create Post
          </Button>
        )}
      </Box>

      <TextField
        fullWidth
        placeholder="Search posts..."
        value={searchQuery}
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} md={6} lg={4} key={post.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {post.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {post.content}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {post.tags && post.tags.split(',').map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag.trim()}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      By {post.author?.firstName} {post.author?.lastName} on{' '}
                      {formatDate(post.createdAt)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/posts/${post.id}`)}
                    >
                      Read More
                    </Button>
                    {isAuthenticated && post.author?.id === posts[0]?.author?.id && (
                      <>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => navigate(`/posts/${post.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Delete />}
                          color="error"
                          onClick={() => handleDelete(post.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.pages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  )
}

export default PostListPage
