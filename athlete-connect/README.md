# Web Development Final Project - *Athlete Connect*

Submitted by: **Mateo Flores**

This web app: **Athlete Connect is a comprehensive social platform designed to help student-athletes connect, share experiences, and mentor each other. Built with React and Supabase, the platform features secure authentication, customizable user profiles, and an interactive feed where users can create posts with text, images, or videos. Athletes can engage through a like system (heart reactions), threaded comments with edit/delete capabilities, and filter content by upvotes or topics. The platform includes a community directory with follow/unfollow functionality, a mentor program with special badges for experienced athletes, and an admin dashboard for platform moderation and analytics. Users can showcase their sport, university, graduation year, and social media links, creating a supportive ecosystem that bridges the gap between student-athletes and facilitates meaningful connections beyond their sport.**

Time spent: **24** hours spent in total

## Required Features

The following **required** functionality is completed:


- [x] **Web app includes a create form that allows the user to create posts**
  - Form requires users to add a post title
  - Forms should have the *option* for users to add: 
    - additional textual content
    - an image added as an external image URL
- [x] **Web app includes a home feed displaying previously created posts**
  - Web app must include home feed displaying previously created posts
  - By default, each post on the posts feed should show only the post's:
    - creation time
    - title 
    - upvotes count
  - Clicking on a post should direct the user to a new page for the selected post
- [x] **Users can view posts in different ways**
  - Users can sort posts by either:
    -  creation time
    -  upvotes count
  - Users can search for posts by title
- [x] **Users can interact with each post in different ways**
  - The app includes a separate post page for each created post when clicked, where any additional information is shown, including:
    - content
    - image
    - comments
  - Users can leave comments underneath a post on the post page
  - Each post includes an upvote button on the post page. 
    - Each click increases the post's upvotes count by one
    - Users can upvote any post any number of times

- [x] **A post that a user previously created can be edited or deleted from its post pages**
  - After a user creates a new post, they can go back and edit the post
  - A previously created post can be deleted from its post page

The following **optional** features are implemented:


- [x] Web app implements pseudo-authentication
  - Users can only edit and delete posts or delete comments by entering the secret key, which is set by the user during post creation
  - **or** upon launching the web app, the user is assigned a random user ID. It will be associated with all posts and comments that they make and displayed on them
  - For both options, only the original user author of a post can update or delete it
- [ ] Users can repost a previous post by referencing its post ID. On the post page of the new post
  - Users can repost a previous post by referencing its post ID
  - On the post page of the new post, the referenced post is displayed and linked, creating a thread
- [ ] Users can customize the interface
  - e.g., selecting the color scheme or showing the content and image of each post on the home feed
- [x] Users can add more characteristics to their posts
  - Users can share and view web videos
  - Users can set flags such as "Question" or "Opinion" while creating a post
  - Users can filter posts by flags on the home feed
  - Users can upload images directly from their local machine as an image file
- [x] Web app displays a loading animation whenever data is being fetched

The following **additional** features are implemented:

* [x] Added community page where people can follow/unfollow
* [x] Admin Dashboard to manage the whole platform
* [x] Pinned post functionality (admin only)

## Video Walkthrough

Here's a walkthrough of implemented features:

![Video Walkthrough](./src/assets/finalproject.gif)

GIF created with ...

[ScreenToGif](https://www.screentogif.com/)

## Notes

It was a bit challenging to put everything together, but such an amazing experince. I loved this project becuase I was able to make it something I could use in my own agency and solve a real problem we had.

## License

    Copyright [2025] [Mateo Flores]

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.