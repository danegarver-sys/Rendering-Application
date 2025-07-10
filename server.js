console.log("=== SERVER.JS DEPLOYED AT " + new Date().toISOString() + " ===");
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

// Serve static files (CSS, JS, images) but not HTML
app.use('/style.css', express.static(__dirname + '/style.css'));
app.use('/script.js', express.static(__dirname + '/script.js'));
app.use('/favicon.ico', express.static(__dirname + '/favicon.ico'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 3 // Max 3 files
    }
}).fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
]);

// Error handling middleware for multer
const handleUpload = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: 'File upload error: ' + err.message });
        }
        next();
    });
};

// Routes
app.get('/', (req, res) => {
    console.log('Root route accessed');
    res.sendFile(__dirname + '/index.html');
});

// Debug route to test if server is responding
app.get('/test', (req, res) => {
    console.log('Test route accessed');
    res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Generate image from multiple inputs
app.post('/generate', handleUpload, async (req, res) => {
    console.log('Generate endpoint accessed');
    console.log('Request headers:', req.headers);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
    
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
        console.log('About to choose generation method. Uploaded images:', uploadedImages.length);
        if (uploadedImages.length > 0) {
            // Image-to-image generation
            console.log('Calling image-to-image generation with prompt:', prompt);
            result = await generateImageToImage(prompt, uploadedImages);
        } else {
            // Text-to-image generation
            console.log('Calling text-to-image generation with prompt:', prompt);
            result = await generateTextToImage(prompt);
        }

        res.json(result);
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate video from multiple inputs
app.post('/generate-video', handleUpload, async (req, res) => {
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
    console.log('TEXT-TO-IMAGE Function called with prompt:', prompt);
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
        console.log('TEXT-TO-IMAGE Making API request...');
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', async () => {
                console.log('TEXT-TO-IMAGE API Response received:', data);
                console.log('TEXT-TO-IMAGE Status code:', res.statusCode);
                if (res.statusCode !== 200 && res.statusCode !== 201) {
                    reject(new Error(`Replicate API error: ${data}`));
                    return;
                }
                const prediction = JSON.parse(data);
                console.log('TEXT-TO-IMAGE Prediction status:', prediction.status);
                
                // Check if prediction was created successfully
                if (prediction.error) {
                    reject(new Error(`Replicate API error: ${prediction.error}`));
                    return;
                }
                
                // If prediction is already completed, return it
                if (prediction.status === 'succeeded' && prediction.output) {
                    console.log('TEXT-TO-IMAGE Prediction already completed');
                    resolve({ image: prediction.output[0] });
                    return;
                }
                
                // If prediction is starting or processing, poll for completion
                if (prediction.status === 'starting' || prediction.status === 'processing') {
                    console.log('TEXT-TO-IMAGE Prediction starting/processing, polling for completion...');
                    try {
                        const result = await pollForCompletion(prediction.id);
                        console.log('TEXT-TO-IMAGE Polling completed successfully');
                        resolve({ image: result.output[0] });
                    } catch (error) {
                        console.log('TEXT-TO-IMAGE Polling failed:', error.message);
                        reject(error);
                    }
                    return;
                }
                
                // If we get here, something unexpected happened
                console.log('TEXT-TO-IMAGE Unexpected status:', prediction.status);
                reject(new Error(`Unexpected prediction status: ${prediction.status}`));
            });
        });

        req.on('error', (error) => {
            console.log('TEXT-TO-IMAGE Request error:', error.message);
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
        version: "c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
        input: {
            prompt: prompt,
            negative_prompt: "blurry, low quality, distorted, unrealistic",
            image: `data:image/jpeg;base64,${base64Data}`,
            num_inference_steps: 50,
            guidance_scale: 7.5,
            strength: 0.75,
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
                if (res.statusCode !== 200 && res.statusCode !== 201) {
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
                
                // If prediction is starting or processing, poll for completion
                if (prediction.status === 'starting' || prediction.status === 'processing') {
                    try {
                        const result = await pollForCompletion(prediction.id);
                        resolve({ image: result.output[0] });
                    } catch (error) {
                        reject(error);
                    }
                    return;
                }
                
                // If we get here, something unexpected happened
                reject(new Error(`Unexpected prediction status: ${prediction.status}`));
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

    // Check if we have images for image-to-video, or use text-to-video
    let postData;
    
    if (images && images.length > 0) {
        // Image-to-video generation - try a working video model
        const baseImage = images[0];
        const base64Data = baseImage.dataUrl.split(',')[1];
        
        postData = JSON.stringify({
            version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
            input: {
                prompt: prompt,
                negative_prompt: "blurry, low quality, distorted, unrealistic",
                input_image: `data:image/jpeg;base64,${base64Data}`,
                num_frames: 16,
                fps: 8
            }
        });
        console.log('VIDEO: Attempting real video generation with image input');
    } else {
        // Text-to-video generation - this model requires an input image
        throw new Error('Video generation requires at least one uploaded image. Please upload an image and try again.');
    }

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
                console.log('VIDEO API Response received:', data);
                if (res.statusCode !== 200 && res.statusCode !== 201) {
                    reject(new Error(`Replicate API error: ${data}`));
                    return;
                }
                const prediction = JSON.parse(data);
                console.log('VIDEO Prediction status:', prediction.status);
                
                // Check if prediction was created successfully
                if (prediction.error) {
                    reject(new Error(`Replicate API error: ${prediction.error}`));
                    return;
                }
                
                // If prediction is already completed, return it
                if (prediction.status === 'succeeded' && prediction.output) {
                    console.log('VIDEO Prediction already completed');
                    // Return actual video output
                    resolve({ video: prediction.output });
                    return;
                }
                
                // If prediction is starting or processing, poll for completion
                if (prediction.status === 'starting' || prediction.status === 'processing') {
                    console.log('VIDEO Prediction starting/processing, polling for completion...');
                    try {
                        const result = await pollForCompletion(prediction.id);
                        console.log('VIDEO Polling completed successfully');
                        // Return actual video output
                        resolve({ video: result.output });
                    } catch (error) {
                        console.log('VIDEO Polling failed:', error.message);
                        reject(error);
                    }
                    return;
                }
                
                // If we get here, something unexpected happened
                console.log('VIDEO Unexpected status:', prediction.status);
                reject(new Error(`Unexpected prediction status: ${prediction.status}`));
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
        let attempts = 0;
        const maxAttempts = 150; // 5 minutes max (150 * 2 seconds)
        
        const checkStatus = () => {
            attempts++;
            console.log(`POLLING Attempt ${attempts}/${maxAttempts}`);
            
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
                    console.log('POLLING Response received:', data);
                    if (res.statusCode !== 200) {
                        reject(new Error(`Replicate API error: ${data}`));
                        return;
                    }
                    const prediction = JSON.parse(data);
                    console.log('POLLING Prediction status:', prediction.status);
                    
                    if (prediction.status === 'succeeded') {
                        console.log('POLLING Prediction succeeded');
                        resolve(prediction);
                    } else if (prediction.status === 'failed') {
                        console.log('POLLING Prediction failed');
                        reject(new Error('Prediction failed'));
                    } else if (prediction.status === 'canceled') {
                        console.log('POLLING Prediction canceled');
                        reject(new Error('Prediction was canceled'));
                    } else if (attempts >= maxAttempts) {
                        console.log('POLLING Max attempts reached');
                        reject(new Error('Prediction timed out after 5 minutes'));
                    } else {
                        console.log(`POLLING Still processing (${prediction.status}), waiting 2 seconds...`);
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