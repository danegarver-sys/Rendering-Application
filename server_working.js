console.log("=== WORKING SERVER.JS DEPLOYED AT " + new Date().toISOString() + " ===");
console.log("=== VIDEO MODEL: db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf ===");
console.log("=== CINEMATIC IMAGE GENERATION ===");
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
        timestamp: new Date().toISOString(),
        serverFile: 'server_working.js',
        videoModel: 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf'
    });
});

// Debug route to test video endpoint
app.get('/test-video', (req, res) => {
    console.log('Test video route accessed');
    res.json({ 
        message: 'Video endpoint is accessible!', 
        timestamp: new Date().toISOString(),
        videoModel: 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
        videoFrames: 'Cinematic Image',
        videoFps: 'High Quality'
    });
});

// Test Replicate API connectivity
app.get('/test-replicate', async (req, res) => {
    console.log('Testing Replicate API connectivity...');
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        return res.json({ error: 'REPLICATE_API_TOKEN not configured' });
    }
    
    try {
        // Test with a simple image generation model
        const postData = JSON.stringify({
            version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
                prompt: "a simple test image",
                negative_prompt: "blurry, low quality",
                num_inference_steps: 20,
                guidance_scale: 7.5
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

        const result = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    console.log('Replicate API test response:', data);
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        resolve({ success: true, data: JSON.parse(data) });
                    } else {
                        resolve({ success: false, error: data, statusCode: res.statusCode });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });

        res.json({
            message: 'Replicate API test completed',
            result: result
        });
    } catch (error) {
        console.error('Replicate API test failed:', error);
        res.json({
            error: error.message,
            message: 'Replicate API test failed'
        });
    }
});

// Generate video from multiple inputs (now cinematic images)
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

        console.log('Starting cinematic image generation with:', {
            prompt,
            negativePrompt,
            imageCount: uploadedImages.length
        });

        // Generate cinematic image
        const result = await generateCinematicImage(prompt, uploadedImages, negativePrompt);
        console.log('Cinematic image generation result:', result);
        res.json(result);
    } catch (error) {
        console.error('Cinematic image generation error:', error);
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
            details: 'Cinematic image generation failed. Please try again with a different prompt or check your Replicate API token.',
            stack: error.stack
        });
    }
});

// Cinematic image generation using Replicate
async function generateCinematicImage(prompt, images, negativePrompt) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured');
    }

    console.log('CINEMATIC: Starting cinematic image generation');
    console.log('CINEMATIC: Prompt:', prompt);
    console.log('CINEMATIC: Negative prompt:', negativePrompt);
    console.log('CINEMATIC: Images count:', images ? images.length : 0);
    
    // Use a working image model for cinematic image generation
    let postData;
    
    if (images && images.length > 0) {
        // Image-to-image generation (cinematic)
        const baseImage = images[0];
        const base64Data = baseImage.dataUrl.split(',')[1];
        
        postData = JSON.stringify({
            version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
                prompt: prompt + ", cinematic, high quality, architectural rendering, movie still, professional photography",
                negative_prompt: negativePrompt,
                image: `data:image/jpeg;base64,${base64Data}`,
                num_inference_steps: 30,
                guidance_scale: 7.5
            }
        });
        console.log('CINEMATIC: Using image-to-image generation (cinematic)');
    } else {
        // Text-to-image generation (cinematic)
        postData = JSON.stringify({
            version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
                prompt: prompt + ", cinematic, high quality, architectural rendering, movie still, professional photography",
                negative_prompt: negativePrompt,
                num_inference_steps: 30,
                guidance_scale: 7.5
            }
        });
        console.log('CINEMATIC: Using text-to-image generation (cinematic)');
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
        console.log('CINEMATIC: Sending request to Replicate API');
        console.log('CINEMATIC: Request data:', postData.substring(0, 500) + '...');
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', async () => {
                console.log('CINEMATIC API Response received:', data);
                console.log('CINEMATIC API Status code:', res.statusCode);
                console.log('CINEMATIC API Response length:', data.length);
                console.log('CINEMATIC API Response preview:', data.substring(0, 500));
                
                if (res.statusCode !== 200 && res.statusCode !== 201) {
                    console.log('CINEMATIC API Error response:', data);
                    reject(new Error(`Replicate API error (${res.statusCode}): ${data}`));
                    return;
                }
                
                const prediction = JSON.parse(data);
                console.log('CINEMATIC Prediction full response:', prediction);
                console.log('CINEMATIC Prediction status:', prediction.status);
                console.log('CINEMATIC Prediction output type:', typeof prediction.output);
                console.log('CINEMATIC Prediction output:', prediction.output);
                
                // Check if prediction was created successfully
                if (prediction.error) {
                    console.log('CINEMATIC Prediction error:', prediction.error);
                    reject(new Error(`Replicate API error: ${prediction.error}`));
                    return;
                }
                
                // If prediction is already completed, return it
                if (prediction.status === 'succeeded' && prediction.output) {
                    console.log('CINEMATIC Prediction already completed');
                    resolve({ image: prediction.output[0] }); // Return cinematic image
                    return;
                }
                
                // If prediction is starting or processing, poll for completion
                if (prediction.status === 'starting' || prediction.status === 'processing') {
                    console.log('CINEMATIC Prediction starting/processing, polling for completion...');
                    try {
                        const result = await pollForCompletion(prediction.id);
                        console.log('CINEMATIC Polling completed successfully');
                        resolve({ image: result.output[0] }); // Return cinematic image
                    } catch (error) {
                        console.log('CINEMATIC Polling failed:', error.message);
                        reject(error);
                    }
                    return;
                }
                
                // If we get here, something unexpected happened
                console.log('CINEMATIC Unexpected status:', prediction.status);
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
    console.log(`Video model: db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf`);
    console.log(`Cinematic image generation enabled`);
}); 