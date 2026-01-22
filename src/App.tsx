import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface Comment {
  user: string;
  text: string;
}

interface Post {
  id: number;
  user: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: Comment[];
}

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [usernames, setUsernames] = useState<{ [key: number]: string }>({});
  const [loadingComments, setLoadingComments] = useState<{
    [key: number]: boolean;
  }>({});
  const [errorMessages, setErrorMessages] = useState<{ [key: number]: string }>(
    {},
  );
  const currentUser = "Zyra";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = async (postId: number) => {
    // Optimistic update
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post,
      ),
    );

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (res.ok && typeof data.likes === "number") {
        setPosts(
          posts.map((post) =>
            post.id === postId ? { ...post, likes: data.likes } : post,
          ),
        );
      }
    } catch {
      // If backend isn't reachable, keep optimistic like (UI still works).
    }
  };

  const handleCommentSubmit = async (postId: number) => {
    const commentText = newComments[postId]?.trim();
    const username = usernames[postId]?.trim() || currentUser;

    if (!commentText) {
      setErrorMessages({
        ...errorMessages,
        [postId]: "Please write a comment",
      });
      return;
    }

    setLoadingComments({ ...loadingComments, [postId]: true });
    setErrorMessages({ ...errorMessages, [postId]: "" });

    try {
      const response = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          username,
          comment: commentText,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPosts(
          posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [
                    ...post.comments,
                    { user: username, text: commentText },
                  ],
                }
              : post,
          ),
        );
        setNewComments({ ...newComments, [postId]: "" });
        setUsernames({ ...usernames, [postId]: "" });
      } else {
        setErrorMessages({
          ...errorMessages,
          [postId]: data.message || "Failed to add comment",
        });
        // Clear the comment input on error/toxicity warning
        setNewComments({ ...newComments, [postId]: "" });
      }
    } catch (error) {
      setErrorMessages({
        ...errorMessages,
        [postId]:
          "Error connecting to server. Make sure the backend is running on port 5000.",
      });
    } finally {
      setLoadingComments({ ...loadingComments, [postId]: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">INSTAFEED</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium">{currentUser}</span>
            <img
              src="https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=50"
              alt={currentUser}
              className="w-10 h-10 rounded-full"
            />
          </div>
        </div>
      </nav>

      {/* Main Feed */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md mb-6 overflow-hidden"
            >
              {/* Post Header */}
              <div className="flex items-center p-4 border-b">
                <img
                  src={post.avatar}
                  alt={post.user}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <span className="font-semibold text-gray-800">{post.user}</span>
              </div>

              {/* Post Image */}
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-96 object-cover"
              />

              {/* Post Actions */}
              <div className="flex gap-4 p-4 border-b text-gray-600">
                <button
                  className="flex items-center gap-2 hover:text-red-500"
                  onClick={() => handleLike(post.id)}
                >
                  <Heart size={24} /> {post.likes}
                </button>
                <button className="flex items-center gap-2 hover:text-blue-500">
                  <MessageCircle size={24} />
                </button>
                <button className="flex items-center gap-2 hover:text-blue-500">
                  <Share2 size={24} />
                </button>
              </div>

              {/* Caption */}
              <div className="px-4 py-2">
                <p className="text-gray-800">
                  <strong>{post.user}</strong> {post.caption}
                </p>
              </div>

              {/* Comments */}
              <div className="px-4 py-3 border-t max-h-64 overflow-y-auto">
                {post.comments.map((comment, idx) => (
                  <div key={idx} className="mb-3">
                    <p className="text-sm">
                      <strong>{comment.user}</strong> {comment.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="px-4 py-4 border-t bg-gray-50">
                {errorMessages[post.id] && (
                  <div className="bg-red-100 text-red-700 text-sm p-2 mb-2 rounded">
                    {errorMessages[post.id]}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Custom username (optional)"
                    value={usernames[post.id] || ""}
                    onChange={(e) =>
                      setUsernames({
                        ...usernames,
                        [post.id]: e.target.value,
                      })
                    }
                    className="w-40 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComments[post.id] || ""}
                    onChange={(e) =>
                      setNewComments({
                        ...newComments,
                        [post.id]: e.target.value,
                      })
                    }
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleCommentSubmit(post.id)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={() => handleCommentSubmit(post.id)}
                    disabled={loadingComments[post.id]}
                    className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {loadingComments[post.id] ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
