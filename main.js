// Advanced Architectural Rendering Generator - Frontend
// NEW FILE: main.js - Video Generation Enabled
console.log('=== NEW MAIN.JS FILE LOADED ===');
console.log('=== VERSION: 1.0 - Video Generation Enabled ===');
console.log('=== CACHE BUST: Completely new filename main.js ===');
console.log('=== TIMESTAMP: 20241201_1430_new_main_file ===');

// Backend URL configuration - GLOBAL SCOPE
const BACKEND_URL = 'https://rendering-application.onrender.com';
console.log('Backend URL defined:', BACKEND_URL);

// Test server connectivity
async function testServerConnection() {
    try {
        console.log('Testing server connection to:', BACKEND_URL);
        const response = await fetch(`${BACKEND_URL}/test`);
        const data = await response.json();
        console.log('Server test response:', data);
        return true;
    } catch (error) {
        console.error('Server connection test failed:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, Backend URL:', BACKEND_URL);
    
    // IMMEDIATE BUTTON CREATION - Add this first
    console.log('=== BUTTONS ALREADY IN HTML - NO DYNAMIC CREATION NEEDED ===');
    
    // Buttons are now in HTML, just need to attach event listeners
    const buttonContainer = document.querySelector('.button-container');
    if (buttonContainer) {
        console.log('Button container found:', buttonContainer);
        console.log('Total buttons in container:', buttonContainer.children.length);
    } else {
        console.error('Button container not found');
    }
    
    // Test server connectivity on page load
    testServerConnection().then(isConnected => {
        if (isConnected) {
            console.log('✅ Server connection successful');
        } else {
            console.log('❌ Server connection failed');
        }
    });

    function setupImageUpload(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '200px';
                    img.style.maxHeight = '200px';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Setup image uploads
    setupImageUpload('imageUpload1', 'imagePreview1');
    setupImageUpload('imageUpload2', 'imagePreview2');
    setupImageUpload('imageUpload3', 'imagePreview3');

    // Form submission
    const form = document.getElementById('uploadForm');
    const promptBox = document.getElementById('prompt');
    const negativePromptBox = document.getElementById('negativePrompt');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Prevent multiple submissions
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating...';
        
        // Collect form data
        const formData = new FormData();
        formData.append('prompt', promptBox.value);
        if (negativePromptBox.value.trim()) {
            formData.append('negativePrompt', negativePromptBox.value);
        }
        
        // Add images and their types
        for (let i = 1; i <= 3; i++) {
            const fileInput = document.getElementById('imageUpload' + i);
            const typeSelect = document.getElementById('imageType' + i);
            
            if (fileInput.files[0]) {
                formData.append('image' + i, fileInput.files[0]);
                formData.append('imageType' + i, typeSelect.value);
            }
        }

        // Show loading spinner and message
        const generatedFrame = document.getElementById('generatedImageFrame');
        generatedFrame.innerHTML = '';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-message';
        loadingMsg.textContent = 'Generating image... This may take 1-2 minutes.';
        generatedFrame.appendChild(spinner);
        generatedFrame.appendChild(loadingMsg);

        try {
            const response = await fetch(`${BACKEND_URL}/generate`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Image generation response:', data);

            if (data.image) {
                generatedFrame.innerHTML = '';
                const genImg = document.createElement('img');
                genImg.src = data.image;
                genImg.alt = 'Generated Image';
                genImg.style.maxWidth = '100%';
                genImg.style.height = 'auto';
                genImg.style.display = 'block';
                genImg.style.margin = '0 auto';
                generatedFrame.appendChild(genImg);

                const downloadBtn = document.createElement('button');
                downloadBtn.id = 'downloadBtn';
                downloadBtn.textContent = 'Download Image';
                downloadBtn.className = 'download-btn';
                downloadBtn.onclick = function() {
                    const link = document.createElement('a');
                    link.href = data.image;
                    link.download = 'generated_image.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
                generatedFrame.appendChild(downloadBtn);
            } else {
                generatedFrame.innerHTML = '<div class="loading-message">Error: ' + (data.error || 'Image generation failed') + '</div>';
            }
        } catch (err) {
            generatedFrame.innerHTML = '<div class="loading-message">Error: ' + err.message + '</div>';
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate Image';
        }
    });

    // Add face generation functionality
    const faceBtn = document.querySelector('.face-btn');
    faceBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Prevent multiple submissions
        faceBtn.disabled = true;
        faceBtn.textContent = 'Generating Face...';
        
        // Collect form data
        const formData = new FormData();
        formData.append('prompt', promptBox.value);
        if (negativePromptBox.value.trim()) {
            formData.append('negativePrompt', negativePromptBox.value);
        }
        
        // Add images and their types
        for (let i = 1; i <= 3; i++) {
            const fileInput = document.getElementById('imageUpload' + i);
            const typeSelect = document.getElementById('imageType' + i);
            
            if (fileInput.files[0]) {
                formData.append('image' + i, fileInput.files[0]);
                formData.append('imageType' + i, typeSelect.value);
            }
        }

        // Show loading spinner and message
        const generatedFrame = document.getElementById('generatedImageFrame');
        generatedFrame.innerHTML = '';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-message';
        loadingMsg.textContent = 'Generating face... This may take 1-2 minutes.';
        generatedFrame.appendChild(spinner);
        generatedFrame.appendChild(loadingMsg);

        try {
            const response = await fetch(`${BACKEND_URL}/generate-face`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Face generation response:', data);

            if (data.image) {
                generatedFrame.innerHTML = '';
                const genImg = document.createElement('img');
                genImg.src = data.image;
                genImg.alt = 'Generated Face';
                genImg.style.maxWidth = '100%';
                genImg.style.height = 'auto';
                genImg.style.display = 'block';
                genImg.style.margin = '0 auto';
                generatedFrame.appendChild(genImg);

                const downloadBtn = document.createElement('button');
                downloadBtn.id = 'downloadBtn';
                downloadBtn.textContent = 'Download Face';
                downloadBtn.className = 'download-btn';
                downloadBtn.onclick = function() {
                    const link = document.createElement('a');
                    link.href = data.image;
                    link.download = 'generated_face.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
                generatedFrame.appendChild(downloadBtn);
            } else {
                generatedFrame.innerHTML = '<div class="loading-message">Error: ' + (data.error || 'Face generation failed') + '</div>';
            }
        } catch (err) {
            generatedFrame.innerHTML = '<div class="loading-message">Error: ' + err.message + '</div>';
        } finally {
            // Re-enable face button
            faceBtn.disabled = false;
            faceBtn.textContent = 'Generate Face';
        }
    });

    // Add enhanced face generation functionality
    const enhancedFaceBtn = document.querySelector('.enhanced-face-btn');
    enhancedFaceBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Prevent multiple submissions
        enhancedFaceBtn.disabled = true;
        enhancedFaceBtn.textContent = 'Generating Enhanced Face...';
        
        // Collect form data
        const formData = new FormData();
        formData.append('prompt', promptBox.value);
        if (negativePromptBox.value.trim()) {
            formData.append('negativePrompt', negativePromptBox.value);
        }
        
        // Add images and their types
        for (let i = 1; i <= 3; i++) {
            const fileInput = document.getElementById('imageUpload' + i);
            const typeSelect = document.getElementById('imageType' + i);
            
            if (fileInput.files[0]) {
                formData.append('image' + i, fileInput.files[0]);
                formData.append('imageType' + i, typeSelect.value);
            }
        }

        // Show loading spinner and message
        const generatedFrame = document.getElementById('generatedImageFrame');
        generatedFrame.innerHTML = '';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-message';
        loadingMsg.textContent = 'Generating enhanced face... This may take 1-2 minutes.';
        generatedFrame.appendChild(spinner);
        generatedFrame.appendChild(loadingMsg);

        try {
            const response = await fetch(`${BACKEND_URL}/generate-face-enhanced`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Enhanced face generation response:', data);

            if (data.image) {
                generatedFrame.innerHTML = '';
                const genImg = document.createElement('img');
                genImg.src = data.image;
                genImg.alt = 'Generated Enhanced Face';
                genImg.style.maxWidth = '100%';
                genImg.style.height = 'auto';
                genImg.style.display = 'block';
                genImg.style.margin = '0 auto';
                generatedFrame.appendChild(genImg);

                const downloadBtn = document.createElement('button');
                downloadBtn.id = 'downloadBtn';
                downloadBtn.textContent = 'Download Enhanced Face';
                downloadBtn.className = 'download-btn';
                downloadBtn.onclick = function() {
                    const link = document.createElement('a');
                    link.href = data.image;
                    link.download = 'generated_enhanced_face.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
                generatedFrame.appendChild(downloadBtn);
            } else {
                generatedFrame.innerHTML = '<div class="loading-message">Error: ' + (data.error || 'Enhanced face generation failed') + '</div>';
            }
        } catch (err) {
            generatedFrame.innerHTML = '<div class="loading-message">Error: ' + err.message + '</div>';
        } finally {
            // Re-enable enhanced face button
            enhancedFaceBtn.disabled = false;
            enhancedFaceBtn.textContent = 'Generate Enhanced Face';
        }
    });

    // Add video generation functionality
    const videoBtn = document.querySelector('.video-btn');
    videoBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Prevent multiple submissions
        videoBtn.disabled = true;
        videoBtn.textContent = 'Generating Video...';
        
        // Collect form data
        const formData = new FormData();
        formData.append('prompt', promptBox.value);
        if (negativePromptBox.value.trim()) {
            formData.append('negativePrompt', negativePromptBox.value);
        }
        
        // Add images and their types
        for (let i = 1; i <= 3; i++) {
            const fileInput = document.getElementById('imageUpload' + i);
            const typeSelect = document.getElementById('imageType' + i);
            
            if (fileInput.files[0]) {
                formData.append('image' + i, fileInput.files[0]);
                formData.append('imageType' + i, typeSelect.value);
            }
        }

        // Show loading spinner and message
        const generatedFrame = document.getElementById('generatedImageFrame');
        generatedFrame.innerHTML = '';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-message';
        loadingMsg.textContent = 'Generating video... This may take 3-5 minutes.';
        generatedFrame.appendChild(spinner);
        generatedFrame.appendChild(loadingMsg);

        try {
            // Call the video generation endpoint
            const response = await fetch(`${BACKEND_URL}/generate-video`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Video generation response data:', data);
            console.log('Response keys:', Object.keys(data));
            console.log('Has video property:', 'video' in data);
            console.log('Has image property:', 'image' in data);

            if (data.video) {
                // Clear the frame completely
                generatedFrame.innerHTML = '';
                console.log('Displaying generated video:', data.video);
                
                const videoElement = document.createElement('video');
                videoElement.src = data.video;
                videoElement.controls = true;
                videoElement.autoplay = false;
                videoElement.style.maxWidth = '100%';
                videoElement.style.height = 'auto';
                videoElement.style.display = 'block';
                videoElement.style.margin = '0 auto';
                generatedFrame.appendChild(videoElement);

                // Add download button
                const downloadBtn = document.createElement('button');
                downloadBtn.id = 'downloadVideoBtn';
                downloadBtn.textContent = 'Download Video';
                downloadBtn.className = 'download-btn';
                downloadBtn.onclick = function() {
                    const link = document.createElement('a');
                    link.href = data.video;
                    link.download = 'generated_video.mp4';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
                generatedFrame.appendChild(downloadBtn);
            } else if (data.image) {
                // Fallback: if we got an image instead of video, display it
                console.log('Received image instead of video, displaying as fallback');
                console.log('Image URL:', data.image);
                generatedFrame.innerHTML = '';
                
                const genImg = document.createElement('img');
                genImg.src = data.image;
                genImg.alt = 'Generated Image (Video Fallback)';
                genImg.style.maxWidth = '100%';
                genImg.style.height = 'auto';
                genImg.style.display = 'block';
                genImg.style.margin = '0 auto';
                generatedFrame.appendChild(genImg);

                const downloadBtn = document.createElement('button');
                downloadBtn.id = 'downloadBtn';
                downloadBtn.textContent = 'Download Image (Video Failed)';
                downloadBtn.className = 'download-btn';
                downloadBtn.onclick = function() {
                    const link = document.createElement('a');
                    link.href = data.image;
                    link.download = 'fallback_image.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
                generatedFrame.appendChild(downloadBtn);
            } else {
                console.log('No video or image found in response');
                generatedFrame.innerHTML = '<div class="loading-message">Error: ' + (data.error || 'Video generation failed') + '</div>';
            }
        } catch (error) {
            console.error('Video generation error:', error);
            let errorMessage = error.message;
            let errorDetails = '';
            
            try {
                const errorResponse = await error.response?.text();
                if (errorResponse) {
                    errorDetails = errorResponse;
                }
            } catch (parseError) {
                console.log('Could not parse error response');
            }
            
            generatedFrame.innerHTML = `
                <div class="loading-message">
                    <p><strong>Error:</strong> ${errorMessage}</p>
                    ${errorDetails ? `<p><strong>Details:</strong> ${errorDetails}</p>` : ''}
                    <p>Video generation failed. This could be due to:</p>
                    <ul style="text-align: left; margin: 10px 0;">
                        <li>Model availability issues</li>
                        <li>Complex prompt that the video model couldn't handle</li>
                        <li>API token or billing issues</li>
                        <li>Server configuration problems</li>
                    </ul>
                    <p>Would you like to generate an image instead?</p>
                    <button onclick="generateImageInstead()" style="margin: 10px 5px; padding: 8px 16px; background: #3a7afe; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Generate Image Instead
                    </button>
                    <button onclick="location.reload()" style="margin: 10px 5px; padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Try Again
                    </button>
                </div>
            `;
        } finally {
            // Re-enable video button
            videoBtn.disabled = false;
            videoBtn.textContent = 'Generate Video';
        }
    });

    // Add fallback function for video generation
    window.generateImageInstead = async function() {
        console.log('Generating image instead of video...');
        
        // Collect form data
        const formData = new FormData();
        formData.append('prompt', promptBox.value);
        if (negativePromptBox.value.trim()) {
            formData.append('negativePrompt', negativePromptBox.value);
        }
        
        // Add images and their types
        for (let i = 1; i <= 3; i++) {
            const fileInput = document.getElementById('imageUpload' + i);
            const typeSelect = document.getElementById('imageType' + i);
            
            if (fileInput.files[0]) {
                formData.append('image' + i, fileInput.files[0]);
                formData.append('imageType' + i, typeSelect.value);
            }
        }

        // Show loading spinner and message
        const generatedFrame = document.getElementById('generatedImageFrame');
        generatedFrame.innerHTML = '';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-message';
        loadingMsg.textContent = 'Generating image... This may take 1-2 minutes.';
        generatedFrame.appendChild(spinner);
        generatedFrame.appendChild(loadingMsg);

        try {
            const response = await fetch(`${BACKEND_URL}/generate`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Fallback image generation response:', data);

            if (data.image) {
                generatedFrame.innerHTML = '';
                const genImg = document.createElement('img');
                genImg.src = data.image;
                genImg.alt = 'Generated Image (Fallback)';
                genImg.style.maxWidth = '100%';
                genImg.style.height = 'auto';
                genImg.style.display = 'block';
                genImg.style.margin = '0 auto';
                generatedFrame.appendChild(genImg);

                const downloadBtn = document.createElement('button');
                downloadBtn.id = 'downloadBtn';
                downloadBtn.textContent = 'Download Image (Fallback)';
                downloadBtn.className = 'download-btn';
                downloadBtn.onclick = function() {
                    const link = document.createElement('a');
                    link.href = data.image;
                    link.download = 'fallback_image.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
                generatedFrame.appendChild(downloadBtn);
            } else {
                generatedFrame.innerHTML = '<div class="loading-message">Error: ' + (data.error || 'Image generation failed') + '</div>';
            }
        } catch (error) {
            console.error('Fallback image generation error:', error);
            generatedFrame.innerHTML = '<div class="loading-message">Error: ' + error.message + '</div>';
        }
    };
}); 