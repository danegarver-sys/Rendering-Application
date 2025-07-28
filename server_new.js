console.log("=== NEW SERVER.JS DEPLOYED AT " + new Date().toISOString() + " ===");
console.log("=== VIDEO MODEL: a00d0b7dcbb9c3fbb34ba87d2d5b46c56977c3eef98aabac255f893ec60f9a38 ===");
console.log("=== VIDEO FRAMES: 24, FPS: 8 ===");
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

// Add cache-busting headers
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Serve static files (CSS, JS, images) but not HTML
app.use('/style.css', express.static(__dirname + '/style.css'));
app.use('/script.js', express.static(__dirname + '/script.js'));
app.use('/main.js', express.static(__dirname + '/main.js'));
app.use('/app.js', express.static(__dirname + '/app.js'));
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

app.get('/main.html', (req, res) => {
    console.log('Main.html route accessed');
    res.sendFile(__dirname + '/main.html');
});

// Test endpoint to verify server is working
app.get('/test', (req, res) => {
    console.log('Test endpoint accessed');
    res.json({ 
        status: 'ok', 
        message: 'Server is working',
        timestamp: new Date().toISOString()
    });
});

// Debug route to test video endpoint
app.get('/test-video', (req, res) => {
    console.log('Test video route accessed');
    res.json({ 
        message: 'Video endpoint is accessible!', 
        timestamp: new Date().toISOString(),
        videoModel: '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        videoFrames: 24,
        videoFps: 8
    });
});

// Generate video from multiple inputs
app.post('/generate-video', handleUpload, async (req, res) => {
    console.log('=== VIDEO ENDPOINT ACCESSED ===');
    console.log('=== SERVER TIMESTAMP:', new Date().toISOString(), '===');
    console.log('Request headers:', req.headers);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
    
    try {
        const { prompt, imageType1, imageType2, imageType3 } = req.body;
        const files = req.files;
        
        console.log('=== VIDEO REQUEST DETAILS ===');
        console.log('Received request:', { prompt, imageType1, imageType2, imageType3 });
        console.log('Files received:', Object.keys(files || {}));

        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Get negative prompt if provided
        const negativePrompt = req.body.negativePrompt || "blurry, low quality, distorted, unrealistic, fast motion, jerky";

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

        console.log('Starting video generation with:', {
            prompt,
            negativePrompt,
            imageCount: uploadedImages.length
        });

        // Generate video
        const result = await generateVideo(prompt, uploadedImages, negativePrompt);
        console.log('Video generation result:', result);
        res.json(result);
    } catch (error) {
        console.error('Video generation error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        
        // Try to get more details about the error
        if (error.message && error.message.includes('Replicate API error')) {
            console.error('Replicate API specific error detected');
        }
        
        res.status(500).json({
            error: error.message,
            details: 'Video generation failed. Please try again with a different prompt or check your Replicate API token.',
            stack: error.stack
        });
    }
});

// Video generation using Replicate
async function generateVideo(prompt, images, negativePrompt) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured');
    }

    console.log('VIDEO: Starting actual video generation');
    console.log('VIDEO: Prompt:', prompt);
    console.log('VIDEO: Negative prompt:', negativePrompt);
    console.log('VIDEO: Images count:', images ? images.length : 0);
    
    // Use the working video model that was working before
    let postData;
    
    if (images && images.length > 0) {
        // Image-to-video generation
        const baseImage = images[0];
        const base64Data = baseImage.dataUrl.split(',')[1];
        
        postData = JSON.stringify({
            version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
            input: {
                prompt: prompt + ", cinematic, high quality, smooth motion",
                negative_prompt: negativePrompt,
                image: `data:image/jpeg;base64,${base64Data}`,
                num_frames: 24,
                fps: 8,
                width: 1024,
                height: 576,
                motion_bucket_id: 127,
                cond_aug: 0.02
            }
        });
        console.log('VIDEO: Using image-to-video generation with stable-video-diffusion');
    } else {
        // Text-to-video generation
        postData = JSON.stringify({
            version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
            input: {
                prompt: prompt + ", cinematic, high quality, smooth motion",
                negative_prompt: negativePrompt,
                num_frames: 24,
                fps: 8,
                width: 1024,
                height: 576,
                motion_bucket_id: 127,
                cond_aug: 0.02
            }
        });
        console.log('VIDEO: Using text-to-video generation with stable-video-diffusion');
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
        console.log('VIDEO: Sending request to Replicate API');
        console.log('VIDEO: Request data:', postData.substring(0, 500) + '...');
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', async () => {
                console.log('VIDEO API Response received:', data);
                console.log('VIDEO API Status code:', res.statusCode);
                console.log('VIDEO API Response length:', data.length);
                console.log('VIDEO API Response preview:', data.substring(0, 500));
                
                if (res.statusCode !== 200 && res.statusCode !== 201) {
                    console.log('VIDEO API Error response:', data);
                    reject(new Error(`Replicate API error (${res.statusCode}): ${data}`));
                    return;
                }
                
                const prediction = JSON.parse(data);
                console.log('VIDEO Prediction full response:', prediction);
                console.log('VIDEO Prediction status:', prediction.status);
                console.log('VIDEO Prediction output type:', typeof prediction.output);
                console.log('VIDEO Prediction output:', prediction.output);
                
                // Check if prediction was created successfully
                if (prediction.error) {
                    console.log('VIDEO Prediction error:', prediction.error);
                    reject(new Error(`Replicate API error: ${prediction.error}`));
                    return;
                }
                
                // If prediction is already completed, return it
                if (prediction.status === 'succeeded' && prediction.output) {
                    console.log('VIDEO Prediction already completed');
                    resolve({ video: prediction.output[0] }); // Return actual video
                    return;
                }
                
                // If prediction is starting or processing, poll for completion
                if (prediction.status === 'starting' || prediction.status === 'processing') {
                    console.log('VIDEO Prediction starting/processing, polling for completion...');
                    try {
                        const result = await pollForCompletion(prediction.id);
                        console.log('VIDEO Polling completed successfully');
                        resolve({ video: result.output[0] }); // Return actual video
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

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Video model: 3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438`);
    console.log(`Video frames: 24, FPS: 8`);
}); 