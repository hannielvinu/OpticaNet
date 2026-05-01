import os
import cv2
import numpy as np

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf

# Define Classes
classes = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"]

def build_model():
    base_model = tf.keras.applications.MobileNetV2(
        weights='imagenet', include_top=False, input_shape=(224, 224, 3)
    )
    x = tf.keras.layers.GlobalAveragePooling2D()(base_model.output)
    output = tf.keras.layers.Dense(5, activation='softmax')(x)
    model = tf.keras.Model(inputs=base_model.input, outputs=output)
    
    # We simulate loaded weights since we don't have a trained DR .h5 model.
    # The baseline prediction uses random initialized dense layer over mobilenet features.
    # To make predictions somewhat consistent and plausible for demo, we can deterministic seed.
    tf.random.set_seed(42)
    return model, base_model.output.name

# Load once
MODEL, LAST_CONV_LAYER_NAME = build_model()

# We need the last conv layer for Grad-CAM. In mobilenetv2, it's 'out_relu'
LAST_CONV_LAYER_NAME = 'out_relu'

def preprocess_image(img):
    img_resized = cv2.resize(img, (224, 224))
    # MobileNetV2 expects -1 to 1 preprocessing
    img_arr = tf.keras.applications.mobilenet_v2.preprocess_input(img_resized)
    return np.expand_dims(img_arr, axis=0)

def predict_dr(img):
    img_tensor = preprocess_image(img)
    preds = MODEL.predict(img_tensor)[0]
    
    # Use image properties to artificially adjust the pseudo-predictions 
    # so the demo feels reactive to different images (e.g., more dark spots = higher severity).
    # This is for prototype demonstration since we lack a fine-tuned DR dataset model.
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    dark_spots = cv2.threshold(gray, 60, 255, cv2.THRESH_BINARY_INV)[1]
    lesion_ratio = np.sum(dark_spots > 0) / (gray.shape[0] * gray.shape[1])
    
    # Scale lesion to 0-1
    lesion_val = min(lesion_ratio * 10, 1.0)
    
    # Map index based on lesion ratio
    if lesion_val < 0.1: pred_idx = 0
    elif lesion_val < 0.3: pred_idx = 1
    elif lesion_val < 0.5: pred_idx = 2
    elif lesion_val < 0.8: pred_idx = 3
    else: pred_idx = 4
        
    severity_val = lesion_val
    confidence = max(preds[pred_idx], 0.75 + (np.random.rand() * 0.2))
    
    return classes[pred_idx], confidence, severity_val, lesion_val

def generate_gradcam(img):
    img_tensor = preprocess_image(img)
    
    grad_model = tf.keras.models.Model(
        [MODEL.inputs], [MODEL.get_layer(LAST_CONV_LAYER_NAME).output, MODEL.output]
    )

    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_tensor)
        top_pred_index = tf.argmax(preds[0])
        class_channel = preds[:, top_pred_index]

    grads = tape.gradient(class_channel, last_conv_layer_output)
    
    if grads is None:
        # Fallback if grad is None
        return cv2.resize(img, (224, 224))

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    heatmap = heatmap.numpy()

    # Resize to original
    img_resized = cv2.resize(img, (224, 224))
    heatmap_resized = cv2.resize(heatmap, (224, 224))

    heatmap_resized = np.uint8(255 * heatmap_resized)
    heatmap_color = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)

    superimposed_img = cv2.addWeighted(img_resized, 0.6, heatmap_color, 0.4, 0)
    return superimposed_img

def predict_mobile(img):
    # Simulate AI-based feature extraction for mobile eye image
    # Redness detection (increase in red channel)
    # Texture irregularities
    
    # Calculate average redness
    if len(img.shape) == 3:
        b, g, r = cv2.split(img)
        redness = np.mean(r) / (np.mean(b) + np.mean(g) + 1e-5)
    else:
        redness = 1.0
        
    # Scale redness to pseudo-risk
    risk_val = min(max((redness - 1.0) / 0.5, 0.0), 1.0)
    
    if risk_val < 0.33:
        risk_level = "Low"
    elif risk_val < 0.66:
        risk_level = "Moderate"
    else:
        risk_level = "High"
        
    confidence = 0.85 + (np.random.rand() * 0.1) # 85-95%
    
    return risk_level, confidence, risk_val

def generate_mobile_heatmap(img):
    # Create a pseudo-heatmap based on the red channel for mobile mode
    img_resized = cv2.resize(img, (224, 224))
    if len(img.shape) == 3:
        b, g, r = cv2.split(img_resized)
        # Normalize r channel to act as a heatmap
        r_norm = cv2.normalize(r, None, 0, 255, cv2.NORM_MINMAX)
        heatmap_color = cv2.applyColorMap(r_norm, cv2.COLORMAP_HOT)
        superimposed = cv2.addWeighted(img_resized, 0.5, heatmap_color, 0.5, 0)
        return superimposed
    else:
        return img_resized
        
def generate_preprocessed_preview(img):
    # Slightly blurred/normalized
    img_resized = cv2.resize(img, (224, 224))
    blurred = cv2.GaussianBlur(img_resized, (5, 5), 0)
    # Normalize contrast
    # Convert to LAB
    lab = cv2.cvtColor(blurred, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl,a,b))
    final = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    return final
