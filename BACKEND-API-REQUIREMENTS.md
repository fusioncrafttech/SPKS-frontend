# SPKS Backend API Requirements

This document contains the complete backend API requirements for the SPKS mobile app and admin panel.

## 1. Authentication APIs

### App APIs

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

### Admin APIs

```http
POST /api/admin/auth/login
POST /api/admin/auth/logout
POST /api/admin/auth/refresh-token
GET  /api/admin/auth/me
```

Required user fields:

```text
firstName
lastName
email
phone
password
profileImage
state
role
status
createdAt
updatedAt
```

Roles:

```text
user
admin
editor
support
```

Passwords must be hashed with Argon2 or bcrypt. Never store plain-text passwords.

## 2. User Profile APIs

### App APIs

```http
GET    /api/users/me
PATCH  /api/users/me
POST   /api/users/me/profile-image
DELETE /api/users/me/profile-image
GET    /api/users/me/settings
PATCH  /api/users/me/settings
DELETE /api/users/me/account
```

### Admin APIs

```http
GET    /api/admin/users
GET    /api/admin/users/:userId
PATCH  /api/admin/users/:userId
PATCH  /api/admin/users/:userId/status
DELETE /api/admin/users/:userId
```

## 3. Course APIs

Courses include:

```text
TNPSC
RRB
TNUSRB
Current Affairs
```

### App APIs

```http
GET /api/courses
GET /api/courses/:courseId
GET /api/courses/:courseId/groups
GET /api/courses/:courseId/categories
GET /api/courses/:courseId/overview
```

### Admin APIs

```http
POST   /api/admin/courses
GET    /api/admin/courses
GET    /api/admin/courses/:courseId
PATCH  /api/admin/courses/:courseId
DELETE /api/admin/courses/:courseId
```

Course fields:

```text
id
name
slug
description
imageUrl
icon
isActive
displayOrder
createdAt
updatedAt
```

## 4. Groups, Classes, and Subjects APIs

### App APIs

```http
GET /api/courses/:courseId/groups
GET /api/courses/:courseId/groups/:groupId
GET /api/groups/:groupId/subjects
GET /api/groups/:groupId/classes
GET /api/classes/:classId/subjects
GET /api/subjects/:subjectId
```

### Admin APIs

```http
POST   /api/admin/groups
GET    /api/admin/groups
PATCH  /api/admin/groups/:groupId
DELETE /api/admin/groups/:groupId

POST   /api/admin/classes
PATCH  /api/admin/classes/:classId
DELETE /api/admin/classes/:classId

POST   /api/admin/subjects
PATCH  /api/admin/subjects/:subjectId
DELETE /api/admin/subjects/:subjectId
```

TNPSC hierarchy:

```text
TNPSC
  -> Group
    -> School Books
      -> Class
        -> Subject
          -> Chapter
            -> Lesson
```

## 5. Study Materials APIs

Study materials include notes, books, PDFs, and outside sources.

### App APIs

```http
GET /api/content
GET /api/content/:contentId
GET /api/courses/:courseId/content
GET /api/courses/:courseId/notes
GET /api/courses/:courseId/books
GET /api/courses/:courseId/outside-sources
GET /api/subjects/:subjectId/content
GET /api/chapters/:chapterId/content
GET /api/content/:contentId/download
```

### Admin APIs

```http
POST   /api/admin/content
GET    /api/admin/content
GET    /api/admin/content/:contentId
PATCH  /api/admin/content/:contentId
DELETE /api/admin/content/:contentId
POST   /api/admin/content/upload
```

Content fields:

```text
id
title
description
contentType
fileUrl
thumbnailUrl
courseId
groupId
classId
subjectId
chapterId
language
isPremium
isPublished
createdAt
updatedAt
```

Content types:

```text
pdf
book
note
article
outside-source
lesson
```

## 6. Chapter and Lesson APIs

### App APIs

```http
GET /api/subjects/:subjectId/chapters
GET /api/chapters/:chapterId
GET /api/chapters/:chapterId/lessons
GET /api/lessons/:lessonId
POST /api/lessons/:lessonId/complete
```

### Admin APIs

```http
POST   /api/admin/chapters
PATCH  /api/admin/chapters/:chapterId
DELETE /api/admin/chapters/:chapterId

POST   /api/admin/lessons
PATCH  /api/admin/lessons/:lessonId
DELETE /api/admin/lessons/:lessonId
```

## 7. Bookmark APIs

### App APIs

```http
GET    /api/users/me/bookmarks
POST   /api/content/:contentId/bookmark
DELETE /api/content/:contentId/bookmark
POST   /api/videos/:videoId/bookmark
DELETE /api/videos/:videoId/bookmark
POST   /api/current-affairs/:articleId/bookmark
DELETE /api/current-affairs/:articleId/bookmark
```

## 8. Video APIs

### App APIs

```http
GET  /api/videos
GET  /api/videos/:videoId
GET  /api/courses/:courseId/videos
GET  /api/videos?category=daily-analysis
POST /api/videos/:videoId/view
POST /api/videos/:videoId/bookmark
```

### Admin APIs

```http
POST   /api/admin/videos
GET    /api/admin/videos
GET    /api/admin/videos/:videoId
PATCH  /api/admin/videos/:videoId
DELETE /api/admin/videos/:videoId
```

Video fields:

```text
id
title
description
youtubeId
videoUrl
thumbnailUrl
category
courseId
duration
isPremium
isPublished
publishedAt
```

## 9. Current Affairs APIs

### App APIs

```http
GET /api/current-affairs
GET /api/current-affairs/:articleId
GET /api/current-affairs?date=2026-08-23
GET /api/current-affairs?category=state
GET /api/current-affairs?category=india
GET /api/current-affairs?category=others
GET /api/current-affairs/monthly
POST /api/current-affairs/:articleId/bookmark
```

### Admin APIs

```http
POST   /api/admin/current-affairs
GET    /api/admin/current-affairs
GET    /api/admin/current-affairs/:articleId
PATCH  /api/admin/current-affairs/:articleId
DELETE /api/admin/current-affairs/:articleId
POST   /api/admin/current-affairs/upload
```

Current affairs fields:

```text
id
title
summary
description
category
state
date
imageUrl
sourceName
sourceUrl
language
isPublished
createdAt
updatedAt
```

Categories:

```text
state
india
international
others
```

## 10. Test APIs

### App APIs

```http
GET  /api/tests
GET  /api/tests/:testId
GET  /api/courses/:courseId/tests
GET  /api/courses/:courseId/tests?groupId=1
POST /api/tests/:testId/start
GET  /api/attempts/:attemptId
POST /api/attempts/:attemptId/answers
POST /api/attempts/:attemptId/submit
GET  /api/attempts/:attemptId/result
GET  /api/users/me/attempts
GET  /api/users/me/test-history
```

### Admin APIs

```http
POST   /api/admin/tests
GET    /api/admin/tests
GET    /api/admin/tests/:testId
PATCH  /api/admin/tests/:testId
DELETE /api/admin/tests/:testId

POST   /api/admin/tests/:testId/questions
PATCH  /api/admin/questions/:questionId
DELETE /api/admin/questions/:questionId
```

Test fields:

```text
id
title
description
courseId
groupId
subjectId
duration
totalQuestions
totalMarks
passingMarks
isPremium
isPublished
```

## 11. Question APIs

Question fields:

```text
id
testId
question
questionImage
options
correctAnswer
explanation
marks
negativeMarks
questionNumber
```

Do not send `correctAnswer` to the app before test submission. Return it only with the result or explanation response.

## 12. Progress and Analytics APIs

### App APIs

```http
GET /api/users/me/progress
GET /api/users/me/course-progress
GET /api/users/me/activity
GET /api/users/me/streak
GET /api/users/me/analytics
GET /api/users/me/stats
```

### Admin APIs

```http
GET /api/admin/analytics/overview
GET /api/admin/analytics/users
GET /api/admin/analytics/courses
GET /api/admin/analytics/tests
GET /api/admin/analytics/revenue
```

Track:

```text
questionsAttempted
questionsCorrect
testsCompleted
averageScore
courseCompletion
dailyStreak
lastActiveDate
timeSpent
```

## 13. Pricing, Subscription, and Payment APIs

### App APIs

```http
GET /api/plans
GET /api/plans/:planId
GET /api/subscriptions/current
GET /api/payments/history
POST /api/payments/create-order
POST /api/payments/verify
POST /api/subscriptions/:subscriptionId/cancel
```

### Admin APIs

```http
POST   /api/admin/plans
GET    /api/admin/plans
PATCH  /api/admin/plans/:planId
DELETE /api/admin/plans/:planId
GET    /api/admin/subscriptions
GET    /api/admin/payments
```

Plan fields:

```text
id
name
price
currency
duration
features
courseAccess
isActive
```

Use Razorpay or another payment provider. Payment verification must happen on the backend. Add a provider webhook for confirmed payments:

```http
POST /api/payments/webhook
```

## 14. Support APIs

### App APIs

```http
GET  /api/help/faqs
POST /api/support/tickets
GET  /api/support/tickets
GET  /api/support/tickets/:ticketId
POST /api/support/tickets/:ticketId/messages
```

### Admin APIs

```http
GET   /api/admin/support/tickets
GET   /api/admin/support/tickets/:ticketId
PATCH /api/admin/support/tickets/:ticketId/status
POST  /api/admin/support/tickets/:ticketId/reply
```

Ticket statuses:

```text
open
in-progress
resolved
closed
```

## 15. Legal APIs

### App APIs

```http
GET /api/legal/terms
GET /api/legal/privacy-policy
GET /api/legal/refund-policy
```

### Admin APIs

```http
PATCH /api/admin/legal/terms
PATCH /api/admin/legal/privacy-policy
PATCH /api/admin/legal/refund-policy
```

## 16. Notification APIs

### App APIs

```http
GET    /api/notifications
PATCH  /api/notifications/:notificationId/read
PATCH  /api/notifications/read-all
POST   /api/users/me/device-token
DELETE /api/users/me/device-token
```

### Admin APIs

```http
POST /api/admin/notifications
GET  /api/admin/notifications
POST /api/admin/notifications/send
```

## 17. Admin Panel Requirements

The admin panel should contain:

```text
Dashboard
User management
Course management
Group management
Class and subject management
Book and PDF management
Notes management
Video management
Current-affairs management
Test management
Question management
Progress analytics
Payment management
Subscription management
Support tickets
Notifications
Terms and privacy settings
Admin user management
```

## 18. Recommended Database Tables

```text
users
admin_users
refresh_tokens
user_settings
courses
groups
classes
subjects
chapters
lessons
content
videos
current_affairs
tests
questions
test_attempts
test_answers
test_results
user_progress
user_activity
bookmarks
plans
subscriptions
payments
support_tickets
support_messages
notifications
device_tokens
legal_documents
```

## 19. Common API Response Format

### Success

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "phone",
      "message": "Invalid phone number"
    }
  ]
}
```

## 20. Recommended Backend Stack

```text
Backend: Node.js + NestJS or Express
Database: PostgreSQL
ORM: Prisma
Authentication: JWT + refresh tokens
File storage: AWS S3 or Cloudinary
Payments: Razorpay
Push notifications: Firebase Cloud Messaging
API documentation: Swagger/OpenAPI
Deployment: Render, Railway, AWS, or DigitalOcean
```

## 21. Recommended Build Order

```text
1. Authentication
2. Users and profiles
3. Courses and content
4. Tests and questions
5. Results and progress
6. Current affairs and videos
7. Admin panel
8. Payments and subscriptions
9. Notifications and support
```
