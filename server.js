const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 3 // Max 3 files
    }
});

// Routes
app.get('/', (req, res) => {
    res.send('Architectural Rendering Backend is running!');
});

// Generate image from multiple inputs
app.post('/generate', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
]), async (req, res) => {
    try {
        const { prompt, imageType1, imageType2, imageType3 } = req.body;
        const files = req.files;
        
        console.log('Received request:', { prompt, imageType1, imageType2, imageType3 });
        console.log('Files received:', Object.keys(files || {}));

        // Validate inputs
        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Process uploaded images
        const uploadedImages = [];
        if (files) {
            for (let i = 1; i <= 3; i++) {
                const fileKey = `image${i}`;
                const typeKey = `imageType${i}`;
                
                if (files[fileKey] && files[fileKey][0]) {
                    const file = files[fileKey][0];
                    const imageType = req.body[typeKey] || 'Photo';
                    
                    // Convert buffer to base64
                    const base64Image = file.buffer.toString('base64');
                    const dataUrl = `data:${file.mimetype};base64,${base64Image}`;
                    
                    uploadedImages.push({
                        dataUrl,
                        type: imageType,
                        filename: file.originalname
                    });
                }
            }
        }

        console.log(`Processing ${uploadedImages.length} images with prompt: ${prompt}`);

        // Choose generation method based on inputs
        let result;
        if (uploadedImages.length > 0) {
            // Image-to-image generation
            result = await generateImageToImage(prompt, uploadedImages);
        } else {
            // Text-to-image generation
            result = await generateTextToImage(prompt);
        }

        res.json(result);
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate video from multiple inputs
app.post('/generate-video', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
]), async (req, res) => {
    try {
        const { prompt, imageType1, imageType2, imageType3 } = req.body;
        const files = req.files;
        
        console.log('Video generation request:', { prompt, imageType1, imageType2, imageType3 });

        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Process uploaded images
        const uploadedImages = [];
        if (files) {
            for (let i = 1; i <= 3; i++) {
                const fileKey = `image${i}`;
                const typeKey = `imageType${i}`;
                
                if (files[fileKey] && files[fileKey][0]) {
                    const file = files[fileKey][0];
                    const imageType = req.body[typeKey] || 'Photo';
                    
                    const base64Image = file.buffer.toString('base64');
                    const dataUrl = `data:${file.mimetype};base64,${base64Image}`;
                    
                    uploadedImages.push({
                        dataUrl,
                        type: imageType,
                        filename: file.originalname
                    });
                }
            }
        }

        // Generate video
        const result = await generateVideo(prompt, uploadedImages);
        res.json(result);
    } catch (error) {
        console.error('Video generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Text-to-image generation using Replicate
async function generateTextToImage(prompt) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured');
    }

    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
                prompt: prompt,
                negative_prompt: "blurry, low quality, distorted, unrealistic",
                num_inference_steps: 50,
                guidance_scale: 7.5,
                width: 1024,
                height: 1024
            }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Replicate API error: ${error}`);
    }

    const prediction = await response.json();
    
    // Poll for completion
    const result = await pollForCompletion(prediction.id);
    return { image: result.output[0] };
}

// Image-to-image generation using Replicate
async function generateImageToImage(prompt, images) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured');
    }

    // Use the first image as the base image
    const baseImage = images[0];
    
    // Remove data URL prefix to get just the base64
    const base64Data = baseImage.dataUrl.split(',')[1];

    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
                prompt: prompt,
                negative_prompt: "blurry, low quality, distorted, unrealistic",
                image: `data:image/jpeg;base64,${base64Data}`,
                num_inference_steps: 50,
                guidance_scale: 7.5,
                strength: 0.8,
                width: 1024,
                height: 1024
            }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Replicate API error: ${error}`);
    }

    const prediction = await response.json();
    
    // Poll for completion
    const result = await pollForCompletion(prediction.id);
    return { image: result.output[0] };
}

// Video generation using Replicate
async function generateVideo(prompt, images) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured');
    }

    // For video generation, we'll use a text-to-video model
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
            input: {
                prompt: prompt,
                negative_prompt: "blurry, low quality, distorted, unrealistic",
                num_frames: 24,
                fps: 8,
                width: 1024,
                height: 576
            }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Replicate API error: ${error}`);
    }

    const prediction = await response.json();
    
    // Poll for completion
    const result = await pollForCompletion(prediction.id);
    return { video: result.output };
}

// Poll for prediction completion
async function pollForCompletion(predictionId) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    while (true) {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: {
                'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const prediction = await response.json();
        
        if (prediction.status === 'succeeded') {
            return prediction;
        } else if (prediction.status === 'failed') {
            throw new Error('Prediction failed');
        }
        
        // Wait 1 second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 