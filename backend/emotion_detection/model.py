import tensorflow as tf
from tensorflow.keras import layers, models

def create_emotion_model(input_shape=(48, 48, 1)):
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(5, activation='softmax')  # 5 emotions
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def preprocess_face(face_image, target_size=(48, 48)):
    # Resize to target size
    face_image = tf.image.resize(face_image, target_size)
    
    # Convert to grayscale if it's not already
    if len(face_image.shape) > 2 and face_image.shape[2] > 1:
        face_image = tf.image.rgb_to_grayscale(face_image)
    
    # Normalize pixel values
    face_image = face_image / 255.0
    
    # Add batch dimension
    face_image = tf.expand_dims(face_image, 0)
    
    return face_image 