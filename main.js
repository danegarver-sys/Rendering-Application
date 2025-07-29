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
            } else if (data.videoSequence) {
                // Display video sequence (multiple frames)
                console.log('Displaying video sequence:', data.videoSequence);
                generatedFrame.innerHTML = '';
                
                // Create container for video sequence
                const sequenceContainer = document.createElement('div');
                sequenceContainer.style.textAlign = 'center';
                sequenceContainer.style.margin = '20px 0';
                
                // Add title
                const title = document.createElement('h3');
                title.textContent = `Video Sequence (${data.frameCount} frames)`;
                title.style.marginBottom = '15px';
                sequenceContainer.appendChild(title);
                
                // Add message
                const message = document.createElement('p');
                message.textContent = data.message || 'Generated video sequence frames:';
                message.style.marginBottom = '15px';
                message.style.color = '#666';
                sequenceContainer.appendChild(message);
                
                // Create frame grid
                const frameGrid = document.createElement('div');
                frameGrid.style.display = 'grid';
                frameGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
                frameGrid.style.gap = '10px';
                frameGrid.style.marginBottom = '20px';
                
                // Add each frame
                data.videoSequence.forEach((frame, index) => {
                    const frameContainer = document.createElement('div');
                    frameContainer.style.border = '1px solid #ddd';
                    frameContainer.style.borderRadius = '8px';
                    frameContainer.style.padding = '10px';
                    frameContainer.style.textAlign = 'center';
                    
                    const frameImg = document.createElement('img');
                    frameImg.src = frame.url;
                    frameImg.alt = `Frame ${frame.frame}`;
                    frameImg.style.maxWidth = '100%';
                    frameImg.style.height = 'auto';
                    frameImg.style.borderRadius = '4px';
                    
                    const frameLabel = document.createElement('p');
                    frameLabel.textContent = `Frame ${frame.frame}`;
                    frameLabel.style.margin = '5px 0 0 0';
                    frameLabel.style.fontSize = '12px';
                    frameLabel.style.color = '#666';
                    
                    frameContainer.appendChild(frameImg);
                    frameContainer.appendChild(frameLabel);
                    frameGrid.appendChild(frameContainer);
                });
                
                sequenceContainer.appendChild(frameGrid);
                
                // Add download buttons for each frame
                const downloadContainer = document.createElement('div');
                downloadContainer.style.marginTop = '15px';
                
                const downloadAllBtn = document.createElement('button');
                downloadAllBtn.textContent = 'Download All Frames';
                downloadAllBtn.className = 'download-btn';
                downloadAllBtn.style.marginRight = '10px';
                downloadAllBtn.onclick = function() {
                    data.videoSequence.forEach((frame, index) => {
                        const link = document.createElement('a');
                        link.href = frame.url;
                        link.download = `frame_${frame.frame}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    });
                };
                downloadContainer.appendChild(downloadAllBtn);
                
                const downloadFirstBtn = document.createElement('button');
                downloadFirstBtn.textContent = 'Download First Frame';
                downloadFirstBtn.className = 'download-btn';
                downloadFirstBtn.style.marginRight = '10px';
                downloadFirstBtn.onclick = function() {
                    const link = document.createElement('a');
                    link.href = data.videoSequence[0].url;
                    link.download = 'first_frame.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
                downloadContainer.appendChild(downloadFirstBtn);
                
                // Add Create MP4 Video button
                const createVideoBtn = document.createElement('button');
                createVideoBtn.textContent = 'Create MP4 Video';
                createVideoBtn.className = 'download-btn';
                createVideoBtn.style.backgroundColor = '#28a745';
                createVideoBtn.style.color = 'white';
                createVideoBtn.onclick = async function() {
                    try {
                        createVideoBtn.textContent = 'Creating Video...';
                        createVideoBtn.disabled = true;
                        
                        // Extract frame URLs
                        const frameUrls = data.videoSequence.map(frame => frame.url);
                        
                        console.log('Creating MP4 video from frames:', frameUrls.length);
                        
                        // Call the video creation endpoint
                        const response = await fetch(`${BACKEND_URL}/create-video`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                frameUrls: frameUrls,
                                fps: 8
                            })
                        });
                        
                        if (response.ok) {
                            // Get the video blob
                            const videoBlob = await response.blob();
                            
                            // Create download link
                            const url = window.URL.createObjectURL(videoBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `generated_video_${Date.now()}.mp4`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                            
                            console.log('Video created and downloaded successfully!');
                        } else {
                            const errorData = await response.json();
                            console.error('Video creation failed:', errorData);
                            alert('Video creation failed: ' + (errorData.error || 'Unknown error'));
                        }
                    } catch (error) {
                        console.error('Error creating video:', error);
                        alert('Error creating video: ' + error.message);
                    } finally {
                        createVideoBtn.textContent = 'Create MP4 Video';
                        createVideoBtn.disabled = false;
                    }
                };
                downloadContainer.appendChild(createVideoBtn);
                
                sequenceContainer.appendChild(downloadContainer);
                generatedFrame.appendChild(sequenceContainer);
                
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