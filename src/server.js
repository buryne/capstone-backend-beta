const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require('morgan')
// const path = require('path')
const passport = require('passport')
const session = require('express-session')
const routerUser = require('./routes/router-user')
const routerPost = require('./routes/router-post')
const {
  createPost,
  getAllPostsView,
  getEditPostView,
  editPost,
} = require('./controllers/controllers-post')
const upload = require('./utils/multer')
const { isLoggedIn } = require('./middleware/authMiddleware')
require('./utils/auth')

const app = express()
const PORT = process.env.PORT || 5000
dotenv.config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(session({ secret: 'cats' }))
app.use(passport.initialize())
app.use(passport.session({ pauseStream: true }))

// app.set('view engine', 'ejs')
// app.set('views', path.join(__dirname, 'views'))

app.use('/api/users', routerUser)
app.use('/api/posts', isLoggedIn, routerPost)

// const isLoggedIn = (req, res, next) => {
//   if (req.user) {
//     // Continue to the next middleware if the user is authenticated
//     return next()
//   }
//   // Render the index page with authentication status
//   // return res.render('index', { isAuthenticated: false })
//   return res.status(401).json({ message: 'Unauthorized' })
// }

app.use((req, res, next) => {
  res.header('Jelajah-Nusantara', 'Jelajah Nusantara API')
  next()
})

// app.get('/', isLoggedIn, async (req, res) => {
//   try {
//     // If the user is authenticated, render a personalized greeting
//     res.render('index', {
//       username: req.user.displayName,
//       isAuthenticated: true,
//     })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// })

app.get('/', isLoggedIn, async (req, res) => {
  try {
    // If the user is authenticated, render a personalized greeting
    res.status(200).json({ message: 'Welcome to Jelajah Nusantara API' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// app.get('/create-post', isLoggedIn, (req, res) => {
//   if (!req.user) {
//     return res.redirect('/') // Redirect to login if not logged in
//   }
//   // Retrieve user information from your authentication system
//   const userId = req.user // Assuming you have the userId in the user object
//   console.log('userId', userId)
//   res.render('create-post', { userId })
// })

app.post('/create-post', isLoggedIn, upload.single('image'), createPost)
// Route to display all posts
app.get('/allPosts', getAllPostsView)
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
  // Setelah autentikasi berhasil, token dapat diambil dari req.user.token
  const accessToken = req.user.accessToken

  // res.redirect('/profile')
  // Lakukan sesuatu dengan token, misalnya, kirimkan kembali ke klien Android
  res.json({ success: true, token: accessToken, user: req.user })
})

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..')
})

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' })
    }
    res.redirect('/')
    // return res.status(200).json({ message: 'Logout successful' })
  })
})

// app.get(
//   'auth/google/callback',
//   passport.authenticate('google', {
//     successRedirect: '/profile',
//     failureRedirect: '/auth/google/failure',
//   }),
// )

app.get('/profile', isLoggedIn, (req, res) => {
  const username = req.user.displayName
  const photoURL = req.user.photoURL
  res.render('profile', { username, photoURL })
})

// Route to display the edit form for a specific post
app.get('/edit-post/:postId', isLoggedIn, getEditPostView)

// Route to handle the form submission when editing a post
app.post('/edit-post/:postId', isLoggedIn, upload.single('image'), editPost)

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' })
})

app.listen(PORT, () => {
  console.log(`[⚡ server] Listening on url http://localhost:${PORT}`)
})
