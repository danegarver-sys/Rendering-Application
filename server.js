const express = require('express');
const cors = require('cors');
const multer = require('multer');
const https = require('https');
const http = require('http');
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

    const postData = JSON.stringify({
        version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
        input: {
            prompt: prompt,
            negative_prompt: "blurry, low quality, distorted, unrealistic",
            num_inference_steps: 50,
            guidance_scale: 7.5,
            width: 1024,
            height: 1024
        }
    });

    const options = {
        hostname: 'api.replicate.com',
        port: 443,
        path: '/v1/predictions',
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', async () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Replicate API error: ${data}`));
                    return;
                }
                const prediction = JSON.parse(data);
                
                // Check if prediction was created successfully
                if (prediction.error) {
                    reject(new Error(`Replicate API error: ${prediction.error}`));
                    return;
                }
                
                // If prediction is already completed, return it
                if (prediction.status === 'succeeded' && prediction.output) {
                    resolve({ image: prediction.output[0] });
                    return;
                }
                
                // Otherwise, poll for completion
                try {
                    const result = await pollForCompletion(prediction.id);
                    resolve({ image: result.output[0] });
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
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

    const postData = JSON.stringify({
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
    });

    const options = {
        hostname: 'api.replicate.com',
        port: 443,
        path: '/v1/predictions',
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', async () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Replicate API error: ${data}`));
                    return;
                }
                const prediction = JSON.parse(data);
                try {
                    const result = await pollForCompletion(prediction.id);
                    resolve({ image: result.output[0] });
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Video generation using Replicate
async function generateVideo(prompt, images) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured');
    }

    // For video generation, we'll use a text-to-video model
    const postData = JSON.stringify({
        version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
        input: {
            prompt: prompt,
            negative_prompt: "blurry, low quality, distorted, unrealistic",
            num_frames: 24,
            fps: 8,
            width: 1024,
            height: 576
        }
    });

    const options = {
        hostname: 'api.replicate.com',
        port: 443,
        path: '/v1/predictions',
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', async () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Replicate API error: ${data}`));
                    return;
                }
                const prediction = JSON.parse(data);
                try {
                    const result = await pollForCompletion(prediction.id);
                    resolve({ video: result.output });
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Poll for prediction completion
async function pollForCompletion(predictionId) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    return new Promise((resolve, reject) => {
        const checkStatus = () => {
            const options = {
                hostname: 'api.replicate.com',
                port: 443,
                path: `/v1/predictions/${predictionId}`,
                method: 'GET',
                headers: {
                    'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode !== 200) {
                        reject(new Error(`Replicate API error: ${data}`));
                        return;
                    }
                    const prediction = JSON.parse(data);
                    
                    if (prediction.status === 'succeeded') {
                        resolve(prediction);
                    } else if (prediction.status === 'failed') {
                        reject(new Error('Prediction failed'));
                    } else {
                        // Still processing, wait and try again
                        setTimeout(checkStatus, 2000);
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.end();
        };

        checkStatus();
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment variables check:');
    console.log('REPLICATE_API_TOKEN exists:', !!process.env.REPLICATE_API_TOKEN);
    console.log('REPLICATE_API_TOKEN length:', process.env.REPLICATE_API_TOKEN ? process.env.REPLICATE_API_TOKEN.length : 0);
    console.log('REPLICATE_API_TOKEN starts with r8_:', process.env.REPLICATE_API_TOKEN ? process.env.REPLICATE_API_TOKEN.startsWith('r8_') : false);
}); 