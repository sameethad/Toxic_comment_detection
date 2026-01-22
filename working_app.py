from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os

app = Flask(__name__,
            template_folder='templates',
            static_folder='static')
CORS(app)

# Sample posts data with more images
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
        "user": "nature_lover",
        "avatar": "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=50",
        "image": "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "caption": "Mountain hiking adventure! 🏔️ #nature #hiking #mountains",
        "likes": 203,
        "comments": [
            {"user": "outdoor_fan", "text": "Breathtaking! What's the trail name?"},
            {"user": "fitness_guru", "text": "Great workout! How long was the hike?"}
        ]
    }
]

def classify_toxicity(text):
    """Simple toxicity classification - can be enhanced with Groq API"""
    toxic_keywords = ['kill', 'hate', 'stupid', 'idiot', 'suck', 'die', 'shut up', 'worst',
                     'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell', 'damn', 'crap']
    text_lower = text.lower()

    # Check for toxic keywords
    for keyword in toxic_keywords:
        if keyword in text_lower:
            return 'toxic'

    # Check for repeated insults or aggressive language
    if any(word in text_lower for word in ['you are', 'you\'re']) and \
       any(word in text_lower for word in ['worst', 'stupid', 'idiot', 'suck', 'hate']):
        return 'toxic'

    return 'not toxic'

@app.route('/')
def index():
    return render_template('index.html', posts=POSTS)

@app.route('/api/posts')
def get_posts():
    return jsonify({"posts": POSTS})

@app.route('/api/comment', methods=['POST'])
def add_comment():
    data = request.json
    post_id = data.get('postId')
    username = data.get('username', 'Anonymous')
    comment_text = data.get('comment')

    if not all([post_id, comment_text]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    # Classify comment toxicity
    classification = classify_toxicity(comment_text)

    if classification == 'not toxic':
        # Add comment to the post
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
        return jsonify({
            "success": False,
            "message": "Comment removed due to toxicity",
            "toxicity": True
        }), 403

if __name__ == '__main__':
    print("🚀 Starting Instagram-like Toxic Comment Detection App...")
    print("📱 Frontend: http://localhost:5173")
    print("🔧 Backend API: http://localhost:5000")
    print("🤖 Toxicity detection: Active (keyword-based)")
    app.run(debug=True, host='0.0.0.0', port=5000)