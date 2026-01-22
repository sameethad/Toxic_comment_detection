# Setup Instructions - Toxic Comment Detection App

## Quick Start

### 1. Set up Environment Variables (Optional - for Groq API)

If you have a Groq API key, create a `.env` file in the `text comment` folder:

```
GROQ_API_KEY=your_groq_api_key_here
```

**Note:** If you don't have a Groq API key, the app will automatically use keyword-based toxicity detection, which works perfectly fine for testing!

### 2. Install Dependencies

**Backend (Python):**
```bash
cd "text comment"
pip install -r requirements.txt
```

**Frontend (Node.js):**
```bash
cd "text comment"
npm install
```

### 3. Start the Application

**Terminal 1 - Start Flask Backend:**
```bash
cd "text comment"
python app.py
```
The backend will run on http://localhost:5000

**Terminal 2 - Start React Frontend:**
```bash
cd "text comment"
npm run dev
```
The frontend will run on http://localhost:5173

### 4. Access the App

Open your browser and go to: **http://localhost:5173**

## Troubleshooting

### Issue: Positive comments are being blocked

**Solution:** Make sure you've restarted the Flask server after code changes:
1. Stop the Flask server (Ctrl+C)
2. Restart it: `python app.py`

The updated code now:
- Uses keyword-based detection when Groq API is not available
- Properly handles Groq API errors and falls back to keyword detection
- Correctly classifies positive comments as "not toxic"

### Issue: Groq API model errors

**Solution:** The app automatically tries multiple Groq models and falls back to keyword detection if all models fail. This ensures the app always works, even without a Groq API key.

### Testing Comments

**Positive comments (should post):**
- "Amazing photo!"
- "So beautiful!"
- "Great work!"
- "Love this!"

**Toxic comments (should be blocked):**
- "You are stupid"
- "This sucks"
- "You're an idiot"
- "Shut up"

## Features

✅ Instagram-like feed with images
✅ Comment posting with toxicity detection
✅ Like functionality
✅ Real-time toxicity checking via Groq API (or keyword fallback)
✅ Beautiful UI with Tailwind CSS
