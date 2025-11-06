````markdown
# 🎬 YouTube Backend API — Practice Project

This project is a **complete YouTube-style backend**, built to practice **Express.js, MongoDB, Cloudinary, and JWT authentication**.  
It includes authentication, video uploads, comments, likes, subscriptions, playlists, and tweets — all modularized with clear controllers and routes.

---

## ⚙️ Tech Stack

- **Node.js** + **Express.js** — Server framework  
- **MongoDB** + **Mongoose** — Database & ORM  
- **Cloudinary** — Media storage for images/videos  
- **JWT** — Authentication  
- **Multer** — File uploads  
- **bcrypt** — Password hashing  
- **Custom Error & Response classes** for clean API design

---

## 🚀 Getting Started

```bash
# Clone and install dependencies
git clone https://github.com/yourusername/youtube-backend-practice.git
cd youtube-backend-practice
npm install

# Set up environment variables (.env)
PORT=your_port
MONGODB_URI=your_mongodb_uri
CORS_ORIGIN=your_frontend_origin
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=days_to_expiry
REFRESH_TOKEN_SECRET_KEY=your_refresh_secret
REFRESH_TOKEN_EXPIRY=days_to_expiry

# Run development server
npm run start
````

---

## 🧩 API ROUTES OVERVIEW

### 🔑 AUTH ROUTES — `/api/v1/users`

| Method | Endpoint                  | Description                                        |
| ------ | ------------------------- | -------------------------------------------------- |
| `POST` | `/signup`                 | Register a new user (uploads avatar + cover image) |
| `POST` | `/login`                  | Log in user and issue access/refresh tokens        |
| `POST` | `/logout`                 | Logout (requires JWT)                              |
| `POST` | `/refresh-token`          | Refresh expired access token                       |
| `POST` | `/change-password`        | Update password                                    |
| `POST` | `/update-account-details` | Edit username or email                             |
| `GET`  | `/me`                     | Get current logged-in user                         |
| `POST` | `/update-avatar-image`    | Update profile picture                             |
| `POST` | `/update-cover-image`     | Update banner image                                |
| `GET`  | `/c/:username`            | Get user channel profile by username               |
| `GET`  | `/watchHistory`           | Get user’s watch history                           |

#### 🧾 Example Response

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "6908aaa917dff1160c365dee",
      "username": "rohan_santra",
      "email": "rohan@example.com",
      "avatar": "https://res.cloudinary.com/demo/image/upload/v123/avatar.png",
      "coverImage": "https://res.cloudinary.com/demo/image/upload/v123/cover.png"
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  },
  "message": "User logged in successfully"
}
```

---

### 🎥 VIDEO ROUTES — `/api/v1/videos`

| Method   | Endpoint                   | Description                                        |
| -------- | -------------------------- | -------------------------------------------------- |
| `GET`    | `/`                        | Get all published videos                           |
| `POST`   | `/`                        | Upload and publish a new video (Cloudinary upload) |
| `GET`    | `/:videoId`                | Get details of a single video                      |
| `DELETE` | `/:videoId`                | Delete a video                                     |
| `PATCH`  | `/:videoId`                | Update video details (title/desc/thumbnail)        |
| `PATCH`  | `/toggle/publish/:videoId` | Toggle video’s publish state                       |

#### 📦 Example Response

```json
{
  "statusCode": 201,
  "data": {
    "_id": "675fd0b3e21f9c4012dc191b",
    "title": "How to Deploy a Node App",
    "description": "Step-by-step guide to deploy Express.js apps",
    "videoFile": "https://res.cloudinary.com/demo/video/upload/v123/deploy.mp4",
    "thumbnail": "https://res.cloudinary.com/demo/image/upload/v123/thumb.jpg",
    "duration": 220,
    "isPublished": true,
    "owner": "6908aaa917dff1160c365dee"
  },
  "message": "Video uploaded successfully"
}
```

---

### 💬 COMMENT ROUTES — `/api/v1/comments`

| Method   | Endpoint        | Description             |
| -------- | --------------- | ----------------------- |
| `POST`   | `/:videoId`     | Add comment to a video  |
| `GET`    | `/:videoId`     | Get comments on a video |
| `PATCH`  | `/c/:commentId` | Update comment          |
| `DELETE` | `/c/:commentId` | Delete comment          |

#### 🗨️ Example Response

```json
{
  "statusCode": 201,
  "data": {
    "_id": "675fd2a2f0d1b13af53b1a3a",
    "content": "Great tutorial!",
    "video": "675fd0b3e21f9c4012dc191b",
    "owner": "6908aaa917dff1160c365dee"
  },
  "message": "Comment added successfully"
}
```

---

### ❤️ LIKE ROUTES — `/api/v1/likes`

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| `POST` | `/toggle/v/:videoId`   | Like/unlike a video   |
| `POST` | `/toggle/c/:commentId` | Like/unlike a comment |
| `POST` | `/toggle/t/:tweetId`   | Like/unlike a tweet   |
| `GET`  | `/video`               | Get all liked videos  |

#### ❤️ Example Response

```json
{
  "statusCode": 200,
  "data": {
    "liked": true,
    "videoId": "675fd0b3e21f9c4012dc191b"
  },
  "message": "Video liked successfully"
}
```

---

### 📜 PLAYLIST ROUTES — `/api/v1/playlists`

| Method   | Endpoint                       | Description                  |
| -------- | ------------------------------ | ---------------------------- |
| `POST`   | `/`                            | Create a playlist            |
| `GET`    | `/:playlistId`                 | Get playlist by ID           |
| `PATCH`  | `/:playlistId`                 | Update playlist info         |
| `DELETE` | `/:playlistId`                 | Delete playlist              |
| `PATCH`  | `/add/:videoId/:playlistId`    | Add a video to playlist      |
| `PATCH`  | `/remove/:videoId/:playlistId` | Remove a video from playlist |
| `GET`    | `/user/:userId`                | Get all playlists of a user  |

#### 🧾 Example Response

```json
{
  "statusCode": 201,
  "data": {
    "_id": "67600c64a14cb95b04628cf0",
    "name": "My Tutorials",
    "description": "All my coding videos",
    "videos": ["675fd0b3e21f9c4012dc191b"],
    "owner": "6908aaa917dff1160c365dee"
  },
  "message": "Playlist created successfully"
}
```

---

### 🧍 SUBSCRIPTION ROUTES — `/api/v1/subscriptions`

| Method | Endpoint           | Description                                 |
| ------ | ------------------ | ------------------------------------------- |
| `GET`  | `/c/:channelId`    | Get all subscribed channels of current user |
| `POST` | `/c/:channelId`    | Toggle subscription to a channel            |
| `GET`  | `/u/:subscriberId` | Get all subscribers of a channel            |

#### 🔔 Example Response

```json
{
  "statusCode": 200,
  "data": {
    "channelId": "675fd9a4f0d1b13af53b1b10",
    "subscribed": true
  },
  "message": "Subscribed to channel successfully"
}
```

---

### 🐦 TWEET ROUTES — `/api/v1/tweets`

| Method   | Endpoint        | Description                   |
| -------- | --------------- | ----------------------------- |
| `POST`   | `/`             | Create a tweet                |
| `GET`    | `/user/:userId` | Get tweets of a specific user |
| `PATCH`  | `/:tweetId`     | Update tweet                  |
| `DELETE` | `/:tweetId`     | Delete tweet                  |

#### 🧾 Example Response

```json
{
  "statusCode": 201,
  "data": {
    "_id": "67600d55a14cb95b04628d09",
    "content": "Just uploaded a new video on React!",
    "owner": "6908aaa917dff1160c365dee"
  },
  "message": "Tweet created successfully"
}
```

---

## 🩺 HEALTH CHECK

| Method | Endpoint              | Description                       |
| ------ | --------------------- | --------------------------------- |
| `GET`  | `/api/v1/healthcheck` | Check if server and DB are online |

#### Example Response

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Server is healthy and running smoothly 🚀"
}
```

---

## 🧠 Key Learnings

* Full-stack backend architecture with clean modular design
* JWT-based authentication system
* Cloudinary integration for media handling
* Efficient use of Mongoose population & aggregation
* Relationship handling between Users, Videos, Likes, Comments, and Subscriptions
* Error-first design with custom `ApiError` and `ApiResponse` utilities

---

## 🧾 Author

**Rohan Santra**
💻 Full-stack developer building YouTube-like backend systems for learning and portfolio purposes.

---

```


