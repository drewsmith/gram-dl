const express = require('express')
const app = express()
const path = require('path')
const fetch = require('node-fetch')

// todo externalize
const clientId = "669c80a9c21a439d897fd1d20aedba0e"
const redirectURI = "http://localhost:3000/oauth"
const tokenURL = `https://api.instagram.com/oauth/authorize/?client_id=${clientId}&redirect_uri=${redirectURI}&response_type=token`

let accessToken = ''

app.get('/', function (req, res) {
  res.redirect(tokenURL)
})

app.get('/oauth', function (req, res) {
  // access_token is a hash that can only be send from the client side
  res.sendFile(path.join(__dirname + '/views/access_token.html'))
})

app.get('/oauth/cb', (req, res) => {
  accessToken = req.query.h

  Promise.all([
    getUserId().then(userId => getRecentMedia(userId, accessToken))
  ]).then(values => {

    let images = values[0].data.map(info => info.images.standard_resolution.url)
    
    res.render('images.ejs', {
      images: images
    })

  })
})

const getRecentMedia = (userId) => {
  return fetch(`https://api.instagram.com/v1/users/${userId}/media/recent/?access_token=${accessToken}`)
    .then(response => response.json())
}

const getUserId = () => {
  return fetch(`https://api.instagram.com/v1/users/self/?access_token=${accessToken}`)
    .then(response => response.json())
    .then(data => data.data.id)
}

const searchUser = (search) => {
  return fetch(`https://api.instagram.com/v1/users/search?q=${search}&access_token=${accessToken}`)
    .then(response => response.json())
    .then(data => data.images)
}

app.listen(3000, function () {
  console.log('Server is running.')
})