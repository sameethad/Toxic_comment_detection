// DOM Elements
const posts = document.querySelectorAll(".post");
const likeBtns = document.querySelectorAll(".like-btn");
const commentInputs = document.querySelectorAll(".comment-input");
const postCommentBtns = document.querySelectorAll(".post-comment-btn");
const notification = document.getElementById("notification");
const authModal = document.getElementById("auth-modal");
const closeModal = document.querySelector(".close");
const authForm = document.getElementById("auth-form");

// Current User (normally would come from authentication)
let currentUser = {
  username: "you_username",
  authenticated: true,
};

// Initialize the app
function init() {
  // Add event listeners
  likeBtns.forEach((btn) => {
    btn.addEventListener("click", handleLike);
  });

  commentInputs.forEach((input) => {
    input.addEventListener("input", handleCommentInput);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const postElement = input.closest(".post");
        const commentText = input.value.trim();
        const postBtn = postElement.querySelector(".post-comment-btn");
        if (postBtn.classList.contains("active")) {
          handlePostComment(postElement);
          input.value = ""; // Clear the input field
        }
      }
    });
  });

  postCommentBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) {
        const postElement = btn.closest(".post");
        handlePostComment(postElement);
      }
    });
  });

  // Auth modal events
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      authModal.classList.remove("active");
    });
  }

  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      if (username && password) {
        // In a real app, this would validate with the server
        currentUser = {
          username: username,
          authenticated: true,
        };

        authModal.classList.remove("active");
        showNotification("Successfully signed in!", "success");
      }
    });
  }

  // Handle clicks outside of the modal
  window.addEventListener("click", (e) => {
    if (e.target === authModal) {
      authModal.classList.remove("active");
    }
  });

  // Double click to like
  document.querySelectorAll(".post-image").forEach((img) => {
    img.addEventListener("dblclick", (e) => {
      const post = e.currentTarget.closest(".post");
      const likeBtn = post.querySelector(".like-btn");

      if (!likeBtn.classList.contains("active")) {
        likeBtn.classList.add("active");
        likeBtn.classList.add("like-animation");

        // Show heart animation
        const heart = document.createElement("div");
        heart.classList.add("heart-animation");
        heart.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                `;

        post.querySelector(".post-image").appendChild(heart);

        setTimeout(() => {
          heart.remove();
        }, 1000);

        // Update like count (would be handled by server in a real app)
        const likesElement = post.querySelector(".post-likes");
        const likesCount = parseInt(likesElement.textContent) + 1;
        likesElement.textContent = `${likesCount} likes`;
      }
    });
  });
}

// Like button handler
function handleLike(e) {
  const likeBtn = e.currentTarget;
  const post = likeBtn.closest(".post");
  const likesElement = post.querySelector(".post-likes");
  const likesText = likesElement.textContent;
  const likesCount = parseInt(likesText);

  if (likeBtn.classList.contains("active")) {
    likeBtn.classList.remove("active");
    likesElement.textContent = `${likesCount - 1} likes`;
  } else {
    likeBtn.classList.add("active");
    likeBtn.classList.add("like-animation");
    likesElement.textContent = `${likesCount + 1} likes`;

    // Remove animation class after animation completes
    setTimeout(() => {
      likeBtn.classList.remove("like-animation");
    }, 300);
  }
}

// Handle comment input changes
function handleCommentInput(e) {
  const input = e.target;
  const postElement = input.closest(".post");
  const postBtn = postElement.querySelector(".post-comment-btn");

  if (input.value.trim() !== "") {
    postBtn.classList.add("active");
  } else {
    postBtn.classList.remove("active");
  }
}

// Handle posting a comment
function handlePostComment(postElement) {
  const commentInput = postElement.querySelector(".comment-input");
  const commentText = commentInput.value.trim();
  const postId = postElement.dataset.postId;

  if (!commentText) return;

  // Check if user is authenticated
  if (!currentUser.authenticated) {
    showAuthModal();
    return;
  }

  // Send to server for toxicity check
  submitComment(postId, currentUser.username, commentText);
}

// Submit comment to API
async function submitComment(postId, username, comment) {
  try {
    const response = await fetch("/api/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId: parseInt(postId), username, comment }),
    });

    const data = await response.json();

    if (data.success) {
      // Comment was accepted
      addCommentToDOM(postId, data.comment);
      showNotification("Comment posted successfully!", "success");
    } else {
      // Comment was rejected (likely due to toxicity)
      showNotification(data.message || "Comment was not approved.", "error");
    }
  } catch (error) {
    console.error("Error submitting comment:", error);
    showNotification("Something went wrong. Please try again.", "error");
  }
}

// Add a comment to the DOM
function addCommentToDOM(postId, comment) {
  const post = document.querySelector(`.post[data-post-id="${postId}"]`);
  if (!post) return;

  const commentsContainer = post.querySelector(".post-comments");
  const commentInput = post.querySelector(".comment-input");
  const postBtn = post.querySelector(".post-comment-btn");

  // Create new comment element
  const commentElement = document.createElement("div");
  commentElement.classList.add("comment");
  commentElement.innerHTML = `
        <span class="username">${comment.user}</span> ${comment.text}
    `;

  // Add to DOM
  commentsContainer.appendChild(commentElement);

  // Clear input and reset button state
  commentInput.value = "";
  postBtn.classList.remove("active");
}

// Show notification
function showNotification(message, type = "default") {
  const notificationElement = document.getElementById("notification");
  const messageElement = notificationElement.querySelector(
    ".notification-message"
  );

  // Reset classes
  notificationElement.classList.remove("success", "error");

  // Set message and type
  messageElement.textContent = message;
  if (type === "success" || type === "error") {
    notificationElement.classList.add(type);
  }

  // Show notification
  notificationElement.classList.add("show");

  // Hide after 3 seconds
  setTimeout(() => {
    notificationElement.classList.remove("show");
  }, 3000);
}

// Show authentication modal
function showAuthModal() {
  authModal.classList.add("active");
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
