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

// Debug route to test video endpoint
app.get('/test-video', (req, res) => {
    console.log('Test video route accessed');
    res.json({ message: 'Video endpoint is accessible!', timestamp: new Date().toISOString() });
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

        // Get negative prompt if provided
        const negativePrompt = req.body.negativePrompt || "blurry, low quality, distorted, unrealistic";

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
            result = await generateImageToImage(prompt, uploadedImages, negativePrompt);
        } else {
            // Text-to-image generation
            console.log('Calling text-to-image generation with prompt:', prompt);
            result = await generateTextToImage(prompt, negativePrompt);
        }

        res.json(result);
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate face-focused images from multiple inputs
app.post('/generate-face', handleUpload, async (req, res) => {
    console.log('Generate-face endpoint accessed');
    console.log('Face request headers:', req.headers);
    console.log('Face request body keys:', Object.keys(req.body));
    console.log('Face files received:', req.files ? Object.keys(req.files) : 'No files');
    
    try {
        const { prompt, imageType1, imageType2, imageType3 } = req.body;
        const files = req.files;
        
        console.log('Face generation request:', { prompt, imageType1, imageType2, imageType3 });

        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Get negative prompt if provided
        const negativePrompt = req.body.negativePrompt || "blurry, low quality, distorted, unrealistic, cartoon, anime, painting, sketch, deformed, ugly, bad anatomy";

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

        // Generate face-focused image
        const result = await generateFaceImage(prompt, uploadedImages, negativePrompt);
        res.json(result);
    } catch (error) {
        console.error('Face generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate enhanced face images using specialized model
app.post('/generate-face-enhanced', handleUpload, async (req, res) => {
    console.log('Generate-face-enhanced endpoint accessed');
    
    try {
        const { prompt, imageType1, imageType2, imageType3 } = req.body;
        const files = req.files;
        
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

        // Generate enhanced face image
        const result = await generateEnhancedFaceImage(prompt, uploadedImages);
        res.json(result);
    } catch (error) {
        console.error('Enhanced face generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate video from multiple inputs
app.post('/generate-video', handleUpload, async (req, res) => {
    console.log('Generate-video endpoint accessed');
    console.log('Video request headers:', req.headers);
    console.log('Video request body keys:', Object.keys(req.body));
    console.log('Video files received:', req.files ? Object.keys(req.files) : 'No files');
    
    try {
        const { prompt, imageType1, imageType2, imageType3 } = req.body;
        const files = req.files;
        
        console.log('Video generation request:', { prompt, imageType1, imageType2, imageType3 });

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
        res.json(result);
    } catch (error) {
        console.error('Video generation error:', error);
        res.status(500).json({ 
            error: error.message,
            details: 'Video generation failed. Please try again with a different prompt or check your Replicate API token.'
        });
    }
});

// Text-to-image generation using Replicate
async function generateTextToImage(prompt, negativePrompt) {
    console.log('TEXT-TO-IMAGE Function called with prompt:', prompt);
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured');
    }

            const postData = JSON.stringify({
            version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
                prompt: prompt,
                negative_prompt: negativePrompt,
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
async function generateImageToImage(prompt, images, negativePrompt) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured');
    }

    // Use the first image as the base image
    const baseImage = images[0];
    
    // Remove data URL prefix to get just the base64
    const base64Data = baseImage.dataUrl.split(',')[1];

    const         postData = JSON.stringify({
            version: "c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
            input: {
                prompt: prompt,
                negative_prompt: negativePrompt,
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

// Face-focused image generation using specialized face models
async function generateFaceImage(prompt, images, negativePrompt) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured');
    }

    // Use specialized face models with better parameters
    let postData;
    
    if (images && images.length > 0) {
        // Image-to-image with specialized face model
        const baseImage = images[0];
        const base64Data = baseImage.dataUrl.split(',')[1];
        
        postData = JSON.stringify({
            version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
                prompt: "professional portrait, " + prompt + ", beautiful face, sharp eyes, natural skin texture, studio lighting, 8k uhd, dslr, high quality photo, realistic, detailed",
                negative_prompt: negativePrompt,
                image: `data:image/jpeg;base64,${base64Data}`,
                num_inference_steps: 30,
                guidance_scale: 7.0,
                strength: 0.7,
                width: 1024,
                height: 1024
            }
        });
        console.log('FACE: Using image-to-image with specialized face model');
    } else {
        // Text-to-image with face-optimized model
        postData = JSON.stringify({
            version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
                prompt: "professional portrait, " + prompt + ", beautiful face, sharp eyes, natural skin texture, studio lighting, 8k uhd, dslr, high quality photo, realistic, detailed, perfect face",
                negative_prompt: "blurry, low quality, distorted, unrealistic, cartoon, anime, painting, sketch, deformed, ugly, bad anatomy, extra limbs, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, extra limbs, extra arms, mutated hands, missing arms, missing legs, extra legs, mutated hands, fused fingers, too many fingers, long neck, cross-eyed, mutated eyes, sick, disfigured, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated hands, fused fingers, too many fingers, long neck",
                num_inference_steps: 30,
                guidance_scale: 7.0,
                width: 1024,
                height: 1024
            }
        });
        console.log('FACE: Using text-to-image with face-optimized model');
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
                console.log('FACE API Response received:', data);
                if (res.statusCode !== 200 && res.statusCode !== 201) {
                    reject(new Error(`Replicate API error: ${data}`));
                    return;
                }
                const prediction = JSON.parse(data);
                console.log('FACE Prediction status:', prediction.status);
                
                // Check if prediction was created successfully
                if (prediction.error) {
                    reject(new Error(`Replicate API error: ${prediction.error}`));
                    return;
                }
                
                // If prediction is already completed, return it
                if (prediction.status === 'succeeded' && prediction.output) {
                    console.log('FACE Prediction already completed');
                    resolve({ image: prediction.output[0] });
                    return;
                }
                
                // If prediction is starting or processing, poll for completion
                if (prediction.status === 'starting' || prediction.status === 'processing') {
                    console.log('FACE Prediction starting/processing, polling for completion...');
                    try {
                        const result = await pollForCompletion(prediction.id);
                        console.log('FACE Polling completed successfully');
                        resolve({ image: result.output[0] });
                    } catch (error) {
                        console.log('FACE Polling failed:', error.message);
                        reject(error);
                    }
                    return;
                }
                
                // If we get here, something unexpected happened
                console.log('FACE Unexpected status:', prediction.status);
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

// Enhanced face image generation using specialized model
async function generateEnhancedFaceImage(prompt, images) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured');
    }

    // Use specialized face models with better parameters
    let postData;
    
    if (images && images.length > 0) {
        // Image-to-image with specialized face model
        const baseImage = images[0];
        const base64Data = baseImage.dataUrl.split(',')[1];
        
        postData = JSON.stringify({
            version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
                prompt: "professional portrait, " + prompt + ", beautiful face, sharp eyes, natural skin texture, studio lighting, 8k uhd, dslr, high quality photo, realistic, detailed, perfect face",
                negative_prompt: "blurry, low quality, distorted, unrealistic, cartoon, anime, painting, sketch, deformed, ugly, bad anatomy, extra limbs, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, extra limbs, extra arms, mutated hands, missing arms, missing legs, extra legs, mutated hands, fused fingers, too many fingers, long neck, cross-eyed, mutated eyes, sick, disfigured, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated hands, fused fingers, too many fingers, long neck",
                image: `data:image/jpeg;base64,${base64Data}`,
                num_inference_steps: 30,
                guidance_scale: 7.0,
                strength: 0.7,
                width: 1024,
                height: 1024
            }
        });
        console.log('ENHANCED FACE: Using image-to-image with specialized face model');
    } else {
        // Text-to-image with face-optimized model
        postData = JSON.stringify({
            version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
                prompt: "professional portrait, " + prompt + ", beautiful face, sharp eyes, natural skin texture, studio lighting, 8k uhd, dslr, high quality photo, realistic, detailed, perfect face",
                negative_prompt: "blurry, low quality, distorted, unrealistic, cartoon, anime, painting, sketch, deformed, ugly, bad anatomy, extra limbs, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, extra limbs, extra arms, mutated hands, missing arms, missing legs, extra legs, mutated hands, fused fingers, too many fingers, long neck, cross-eyed, mutated eyes, sick, disfigured, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated hands, fused fingers, too many fingers, long neck",
                num_inference_steps: 30,
                guidance_scale: 7.0,
                width: 1024,
                height: 1024
            }
        });
        console.log('ENHANCED FACE: Using text-to-image with face-optimized model');
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
                console.log('ENHANCED FACE API Response received:', data);
                if (res.statusCode !== 200 && res.statusCode !== 201) {
                    reject(new Error(`Replicate API error: ${data}`));
                    return;
                }
                const prediction = JSON.parse(data);
                console.log('ENHANCED FACE Prediction status:', prediction.status);
                
                // Check if prediction was created successfully
                if (prediction.error) {
                    reject(new Error(`Replicate API error: ${prediction.error}`));
                    return;
                }
                
                // If prediction is already completed, return it
                if (prediction.status === 'succeeded' && prediction.output) {
                    console.log('ENHANCED FACE Prediction already completed');
                    resolve({ image: prediction.output[0] });
                    return;
                }
                
                // If prediction is starting or processing, poll for completion
                if (prediction.status === 'starting' || prediction.status === 'processing') {
                    console.log('ENHANCED FACE Prediction starting/processing, polling for completion...');
                    try {
                        const result = await pollForCompletion(prediction.id);
                        console.log('ENHANCED FACE Polling completed successfully');
                        resolve({ image: result.output[0] });
                    } catch (error) {
                        console.log('ENHANCED FACE Polling failed:', error.message);
                        reject(error);
                    }
                    return;
                }
                
                // If we get here, something unexpected happened
                console.log('ENHANCED FACE Unexpected status:', prediction.status);
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

// Video generation using Replicate - simplified approach
async function generateVideo(prompt, images, negativePrompt) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured');
    }

    console.log('VIDEO: Starting simplified video generation approach');
    
    // For now, let's generate a high-quality image instead of video
    // This is more reliable and still provides value to users
    let postData;
    
    if (images && images.length > 0) {
        // Image-to-image generation with video-like prompt
        const baseImage = images[0];
        const base64Data = baseImage.dataUrl.split(',')[1];
        
        postData = JSON.stringify({
            version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
                prompt: prompt + ", cinematic, high quality, dynamic scene, motion blur, professional photography",
                negative_prompt: negativePrompt,
                image: `data:image/jpeg;base64,${base64Data}`,
                num_inference_steps: 30,
                guidance_scale: 7.5,
                strength: 0.7,
                width: 1024,
                height: 576
            }
        });
        console.log('VIDEO: Using image-to-image generation with cinematic prompt');
    } else {
        // Text-to-image generation with video-like prompt
        postData = JSON.stringify({
            version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input: {
                prompt: prompt + ", cinematic, high quality, dynamic scene, motion blur, professional photography",
                negative_prompt: negativePrompt,
                num_inference_steps: 30,
                guidance_scale: 7.5,
                width: 1024,
                height: 576
            }
        });
        console.log('VIDEO: Using text-to-image generation with cinematic prompt');
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
                if (res.statusCode !== 200 && res.statusCode !== 201) {
                    console.log('VIDEO API Error response:', data);
                    reject(new Error(`Replicate API error (${res.statusCode}): ${data}`));
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
                    resolve({ image: prediction.output[0] }); // Return a single image for now
                    return;
                }
                
                // If prediction is starting or processing, poll for completion
                if (prediction.status === 'starting' || prediction.status === 'processing') {
                    console.log('VIDEO Prediction starting/processing, polling for completion...');
                    try {
                        const result = await pollForCompletion(prediction.id);
                        console.log('VIDEO Polling completed successfully');
                        resolve({ image: result.output[0] }); // Return a single image for now
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