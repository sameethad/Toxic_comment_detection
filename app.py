from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from groq import Groq
import os

print("Starting Flask app...")

app = Flask(__name__,
            template_folder='templates',
            static_folder='static')
CORS(app)  # Enable CORS for all routes

print("Flask app created")

def _maybe_load_dotenv():
    """
    Load .env if python-dotenv is installed (optional).
    This keeps the project working even if the dependency isn't present.
    """
    try:
        from dotenv import load_dotenv  # type: ignore
        load_dotenv()
    except Exception:
        pass

_maybe_load_dotenv()

# Initialize Groq client with API key (never hardcode secrets!)
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None
if not client:
    print("Warning: GROQ_API_KEY not set. Running in mock mode (keyword-based).")

# Sample posts data
POSTS = [
    {
        "id": 1,
        "user": "travel_enthusiast",
        "avatar": "https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=50",
        "image": "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "caption": "Beautiful sunset at the beach! 🌅 #travel #sunset #beach",
        "likes": 125,
        "comments": [
            {"user": "alex92", "text": "Amazing view! I need to visit there."},
            {"user": "photography_lover", "text": "The colors are stunning!"}
        ]
    },
    {
        "id": 2,
        "user": "food_explorer",
        "avatar": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=50",
        "image": "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "caption": "Homemade pasta night! 🍝 #foodie #homecooking #pasta",
        "likes": 87,
        "comments": [
            {"user": "chef_mike", "text": "Looks delicious! What sauce did you use?"},
            {"user": "pasta_fan", "text": "Nothing beats homemade pasta!"}
        ]
    },
    {
        "id": 3,
        "user": "city_frames",
        "avatar": "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=50",
        "image": "https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "caption": "Late-night city lights ✨ #city #night #streetphotography",
        "likes": 342,
        "comments": [
            {"user": "neon_vibes", "text": "This looks like a movie scene!"},
        ],
    },
    {
        "id": 4,
        "user": "pets_daily",
        "avatar": "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=50",
        "image": "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "caption": "Someone is ready for treats 🐶 #dog #pets #goodboy",
        "likes": 901,
        "comments": [
            {"user": "pawsome", "text": "So cute!"},
            {"user": "dogmom", "text": "Those eyes 😭"},
        ],
    },
]

@app.route('/')
def index():
    return render_template('index.html', posts=POSTS)

@app.route('/api/posts')
def get_posts():
    return jsonify({"posts": POSTS})

def classify_toxicity(text):
    """
    Classify comment as toxic or not toxic.
    Uses Groq API if available, otherwise falls back to keyword-based detection.
    """
    # Fallback keyword-based classification (used when Groq API is not available)
    toxic_keywords = ['kill', 'hate', 'stupid', 'idiot', 'suck', 'die', 'shut up', 'worst', 
                     'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell', 'you suck', 'you\'re stupid',
                     'you are stupid', 'you\'re an idiot', 'you are an idiot']
    
    if not client:
        # Mock mode - simple keyword-based classification for testing
        text_lower = text.lower()
        for keyword in toxic_keywords:
            if keyword in text_lower:
                print(f"[Keyword-based] Classified as TOXIC: {text[:50]}")
                return 'toxic'
        print(f"[Keyword-based] Classified as NOT TOXIC: {text[:50]}")
        return 'not toxic'
    
    # Use Groq API for classification
    try:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a content moderation AI. Classify comments as TOXIC or NOT TOXIC.\n\n"
                    "A comment is TOXIC if it contains:\n"
                    "- Profanity, swearing, or offensive language\n"
                    "- Personal attacks, insults, or harassment (e.g., 'you suck', 'you're stupid', 'shut up')\n"
                    "- Hate speech, threats, or bullying\n"
                    "- Any message meant to hurt, intimidate, or humiliate someone\n\n"
                    "A comment is NOT TOXIC if it is:\n"
                    "- Positive, supportive, or neutral\n"
                    "- Constructive feedback\n"
                    "- Friendly conversation\n\n"
                    "Respond with ONLY one word: 'toxic' or 'not toxic' (lowercase, no punctuation)."
                ),
            },
            {
                "role": "user",
                "content": f"Classify this comment: {text.strip()}",
            },
        ]

        # Try multiple models in order of preference
        models_to_try = ["llama-3.1-8b-instant", "llama-3.1-70b-versatile", "mixtral-8x7b-32768"]
        chat_completion = None
        last_error = None
        
        for model_name in models_to_try:
            try:
                chat_completion = client.chat.completions.create(
                    messages=messages,
                    model=model_name,
                    temperature=0.0,
                    max_tokens=10,
                )
                break  # Success, exit loop
            except Exception as e:
                last_error = e
                continue  # Try next model
        
        if not chat_completion:
            raise Exception(f"All models failed. Last error: {last_error}")

        raw_response = (chat_completion.choices[0].message.content or "").strip().lower()
        
        # Try to parse JSON first
        import json
        try:
            parsed = json.loads(raw_response)
            label = str(parsed.get("label", "")).strip().lower()
        except:
            # If not JSON, check if it's plain text "toxic" or "not toxic"
            label = raw_response
        
        # Clean up the label
        if "toxic" in label and "not" not in label:
            result = "toxic"
        elif "not toxic" in label or ("not" in label and "toxic" in label):
            result = "not toxic"
        else:
            # Fallback: check keywords if Groq response is unclear
            text_lower = text.lower()
            for keyword in toxic_keywords:
                if keyword in text_lower:
                    print(f"[Groq unclear, keyword fallback] Classified as TOXIC: {text[:50]}")
                    return 'toxic'
            result = "not toxic"
        
        print(f"[Groq API] Classified as {result.upper()}: {text[:50]}")
        return result
        
    except Exception as e:
        print(f"[Groq API Error] {e} - Falling back to keyword detection")
        # Fallback to keyword-based detection on error
        text_lower = text.lower()
        for keyword in toxic_keywords:
            if keyword in text_lower:
                return 'toxic'
        return 'not toxic'


@app.route('/api/comment', methods=['POST'])
def add_comment():
    data = request.json
    post_id = data.get('postId')
    username = data.get('username')
    comment_text = data.get('comment')
    
    if not all([post_id, comment_text]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
    if not username:
        username = "Anonymous"
    
    classification = classify_toxicity(comment_text)
    
    if classification == 'not toxic':
        for post in POSTS:
            if post['id'] == post_id:
                post['comments'].append({"user": username, "text": comment_text})
                return jsonify({
                    "success": True,
                    "message": "Comment added successfully",
                    "comment": {"user": username, "text": comment_text}
                })
        return jsonify({"success": False, "message": "Post not found"}), 404
    else:
        return jsonify({"success": False, "message": "Comment removed due to toxicity"}), 403

@app.route('/api/like', methods=['POST'])
def like_post():
    data = request.json or {}
    post_id = data.get("postId")
    if not post_id:
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    for post in POSTS:
        if post["id"] == post_id:
            post["likes"] = int(post.get("likes", 0)) + 1
            return jsonify({"success": True, "likes": post["likes"]})
    return jsonify({"success": False, "message": "Post not found"}), 404

if __name__ == '__main__':
    print("Running Flask app on port 5000...")
    app.run(debug=True, host="0.0.0.0", port=5000)
