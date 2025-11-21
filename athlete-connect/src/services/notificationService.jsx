import { supabase } from '../supabaseClient';

// Create a notification for a user
export const createNotification = async (userId, type, title, message, link = null) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        link
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

// Notify post author when someone comments
export const notifyNewComment = async (postAuthorId, commenterName, postTitle, postId, commenterId) => {
  // Don't notify if commenting on own post
  if (postAuthorId === commenterId) return;

  return createNotification(
    postAuthorId,
    'comment',
    'New comment on your post',
    `${commenterName} commented on "${postTitle}"`,
    `/post/${postId}`
  );
};

// Notify user when someone follows them
export const notifyNewFollower = async (followedUserId, followerName, followerId) => {
  // Don't notify self
  if (followedUserId === followerId) return;

  return createNotification(
    followedUserId,
    'follow',
    'New follower',
    `${followerName} started following you`,
    `/profile/${followerId}`
  );
};

// Notify user when someone likes their post
export const notifyPostLike = async (postAuthorId, likerName, postTitle, postId, likerId) => {
  // Don't notify if liking own post
  if (postAuthorId === likerId) return;

  return createNotification(
    postAuthorId,
    'like',
    'Someone liked your post',
    `${likerName} liked "${postTitle}"`,
    `/post/${postId}`
  );
};

// Notify followers when someone makes a new post
export const notifyFollowersNewPost = async (postAuthorId, postAuthorName, postTitle, postId) => {
  try {
    // Get all followers
    const { data: followers, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', postAuthorId);

    if (error) throw error;

    // Create notifications for each follower
    const notifications = followers.map(follower => ({
      user_id: follower.follower_id,
      type: 'post',
      title: 'New post from someone you follow',
      message: `${postAuthorName} posted: "${postTitle}"`,
      link: `/post/${postId}`
    }));

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error notifying followers:', error);
    return false;
  }
};