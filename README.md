# Instagram-like Toxic Comment Detection App

A social media feed application similar to Instagram that detects and blocks toxic comments using AI.

## Features

- 📱 Instagram-like social media feed
- 🖼️ Beautiful image posts with captions
- 💬 Real-time commenting system
- 🤖 AI-powered toxicity detection
- 🚫 Automatic blocking of toxic comments
- ⚡ Modern React frontend with Flask backend

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Flask + Python
- **AI**: Groq API for toxicity detection
- **Styling**: Tailwind CSS with custom components

## Installation & Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- Git

### Backend Setup

1. **Navigate to the project directory:**
   ```bash
   cd "text comment"
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables (optional for Groq API):**
   Create a `.env` file in the project root:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

### Frontend Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

## Running the Application

### Option 1: Run Both Frontend and Backend

1. **Start the Flask backend:**
   ```bash
   python working_app.py
   ```
   The backend will run on http://localhost:5000

2. **In a new terminal, start the React frontend:**
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:5173

### Option 2: Run with Full Groq Integration

If you have a Groq API key, use the main app.py instead:

```bash
python app.py
```

## How It Works

1. **Feed Display**: Users see a feed of posts with images, captions, and existing comments
2. **Commenting**: Users can add comments to posts
3. **Toxicity Detection**: Each comment is analyzed for toxic content using AI
4. **Response**:
   - ✅ **Safe comments**: Posted immediately
   - ❌ **Toxic comments**: Blocked with error message "Comment removed due to toxicity"

## API Endpoints

- `GET /` - Serve the main HTML page
- `GET /api/posts` - Get all posts
- `POST /api/comment` - Add a comment (with toxicity check)

## Sample Toxic Comments (will be blocked)

- "You suck!"
- "This is stupid"
- "I hate you"
- "Shut up already"
- "You're an idiot"

## Sample Safe Comments (will be posted)

- "Amazing view!"
- "Looks delicious!"
- "Great photo ❤️"
- "So beautiful!"
- "Love this!"

## Project Structure

```
text comment/
├── app.py                 # Main Flask app with Groq integration
├── working_app.py         # Simplified Flask app for testing
├── requirements.txt       # Python dependencies
├── package.json          # Node.js dependencies
├── src/
│   ├── App.tsx          # Main React component
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles
├── templates/
│   └── index.html       # Jinja2 template
├── static/              # Static files (CSS, JS)
└── dist/                # Built React app
```

## Customization

### Adding More Posts

Edit the `POSTS` list in `working_app.py` or `app.py`:

```python
{
    "id": 4,
    "user": "your_username",
    "avatar": "https://example.com/avatar.jpg",
    "image": "https://example.com/post-image.jpg",
    "caption": "Your caption here!",
    "likes": 42,
    "comments": []
}
```

### Modifying Toxicity Detection

The toxicity detection uses keyword matching. For production, integrate with Groq API by setting the `GROQ_API_KEY` environment variable.

## Troubleshooting

### Backend Not Starting
- Check if port 5000 is available
- Ensure all Python dependencies are installed
- Check for syntax errors in the Flask app

### Frontend Not Loading
- Ensure Node.js dependencies are installed
- Check if port 5173 is available
- Clear browser cache

### Comments Not Posting
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify the comment doesn't contain toxic keywords

## License

This project is for educational purposes. Feel free to modify and improve!