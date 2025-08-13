from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
from pest_info import pest_details

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = "models/pest_model.h5"
model = load_model(MODEL_PATH)

# Get class labels
class_labels = ['aphids', 'armyworm', 'beetle', 'bollworm', 'grasshopper', 'mites', 'mosquito', 'sawfly', 'stem_borer']

@app.route('/api/upload', methods=['POST'])
@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        print("No image file provided in the request.")
        return jsonify({'success': False, 'message': 'No image file provided'}), 400

    image_file = request.files['image']
    print(f"Received image: {image_file.filename}")

    try:
        # Preprocess the image
        IMG_HEIGHT = 224
        IMG_WIDTH = 224
        image = Image.open(image_file).resize((IMG_WIDTH, IMG_HEIGHT)).convert("RGB")
        image_array = np.array(image) / 255.0  # Normalize pixel values
        image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
        print(f"Image preprocessed successfully. Shape: {image_array.shape}")

        # Predict using the model
        predictions = model.predict(image_array)
        print(f"Raw predictions: {predictions}")

        # Check if predictions are valid
        if len(predictions) == 0 or len(predictions[0]) != len(class_labels):
            print("Prediction mismatch with class labels.")
            print(f"Class labels: {class_labels}")
            print(f"Number of class labels: {len(class_labels)}")
            return jsonify({'success': False, 'message': 'Prediction mismatch with class labels'}), 500

        predicted_class_index = np.argmax(predictions)
        print(f"Predicted class index: {predicted_class_index}")

        # Ensure index is within bounds
        if predicted_class_index >= len(class_labels):
            print(f"Predicted class index {predicted_class_index} out of bounds.")
            return jsonify({'success': False, 'message': 'Predicted class index out of bounds'}), 500

        predicted_class = class_labels[predicted_class_index]
        print(f"Predicted class: {predicted_class}")

        # Fetch pest details
        pest_info = pest_details.get(predicted_class, {
            "name": "Unknown Pest",
            "description": "No description available.",
            "solutions": ["No solutions available."]
        })
        print(f"Pest info retrieved: {pest_info}")

        return jsonify({'success': True, 'pest_info': pest_info}), 200

    except Exception as e:
        print(f"Error occurred during prediction: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True)