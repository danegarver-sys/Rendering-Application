document.addEventListener('DOMContentLoaded', function() {
    // Backend URL - update this when you deploy to Render.com
    const BACKEND_URL = 'https://rendering-application.onrender.com'; // Your deployed Render URL
    
    // Debug: Log the backend URL to console
    console.log('Backend URL:', BACKEND_URL);
    
    function setupImageUpload(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        input.addEventListener('change', function() {
            preview.innerHTML = '';
            const file = input.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '200px';
                    img.style.objectFit = 'contain';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    setupImageUpload('imageUpload1', 'imagePreview1');
    setupImageUpload('imageUpload2', 'imagePreview2');
    setupImageUpload('imageUpload3', 'imagePreview3');

    const uploadForm = document.getElementById('uploadForm');
    const promptBox = document.getElementById('prompt');

    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Prevent multiple submissions
        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating...';
        
        // Collect form data
        const formData = new FormData();
        formData.append('prompt', promptBox.value);
        
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
        loadingMsg.textContent = 'Generating rendering... This may take 1-2 minutes.';
        generatedFrame.appendChild(spinner);
        generatedFrame.appendChild(loadingMsg);

        try {
            // Call the backend
            const response = await fetch(`${BACKEND_URL}/generate`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.image) {
                // Clear the frame completely
                generatedFrame.innerHTML = '';
                console.log('Displaying generated image:', data.image);
                
                const genImg = document.createElement('img');
                genImg.src = data.image;
                genImg.alt = 'Generated Rendering';
                genImg.style.maxWidth = '100%';
                genImg.style.height = 'auto';
                genImg.style.display = 'block';
                genImg.style.margin = '0 auto';
                generatedFrame.appendChild(genImg);

                // Add download button
                const downloadBtn = document.createElement('button');
                downloadBtn.id = 'downloadBtn';
                downloadBtn.textContent = 'Download Image';
                downloadBtn.className = 'download-btn';
                downloadBtn.onclick = function() {
                    const link = document.createElement('a');
                    link.href = data.image;
                    link.download = 'generated_rendering.png';
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
    const faceBtn = document.createElement('button');
    faceBtn.textContent = 'Generate Face';
    faceBtn.className = 'face-btn';
    faceBtn.style.marginTop = '10px';
    faceBtn.style.marginRight = '10px';
    
    faceBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Prevent multiple submissions
        faceBtn.disabled = true;
        faceBtn.textContent = 'Generating Face...';
        
        // Collect form data
        const formData = new FormData();
        formData.append('prompt', promptBox.value);
        
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
        loadingMsg.textContent = 'Generating face-focused image... This may take 1-2 minutes.';
        generatedFrame.appendChild(spinner);
        generatedFrame.appendChild(loadingMsg);

        try {
            // Call the face generation endpoint
            const response = await fetch(`${BACKEND_URL}/generate-face`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.image) {
                // Clear the frame completely
                generatedFrame.innerHTML = '';
                console.log('Displaying generated face image:', data.image);
                
                const genImg = document.createElement('img');
                genImg.src = data.image;
                genImg.alt = 'Generated Face Image';
                genImg.style.maxWidth = '100%';
                genImg.style.height = 'auto';
                genImg.style.display = 'block';
                genImg.style.margin = '0 auto';
                generatedFrame.appendChild(genImg);

                // Add download button
                const downloadBtn = document.createElement('button');
                downloadBtn.id = 'downloadBtn';
                downloadBtn.textContent = 'Download Face Image';
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
    const enhancedFaceBtn = document.createElement('button');
    enhancedFaceBtn.textContent = 'Generate Enhanced Face';
    enhancedFaceBtn.className = 'enhanced-face-btn';
    enhancedFaceBtn.style.marginTop = '10px';
    enhancedFaceBtn.style.marginRight = '10px';
    
    enhancedFaceBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Prevent multiple submissions
        enhancedFaceBtn.disabled = true;
        enhancedFaceBtn.textContent = 'Generating Enhanced Face...';
        
        // Collect form data
        const formData = new FormData();
        formData.append('prompt', promptBox.value);
        
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
        loadingMsg.textContent = 'Generating enhanced face image... This may take 1-2 minutes.';
        generatedFrame.appendChild(spinner);
        generatedFrame.appendChild(loadingMsg);

        try {
            // Call the enhanced face generation endpoint
            const response = await fetch(`${BACKEND_URL}/generate-face-enhanced`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.image) {
                // Clear the frame completely
                generatedFrame.innerHTML = '';
                console.log('Displaying enhanced face image:', data.image);
                
                const genImg = document.createElement('img');
                genImg.src = data.image;
                genImg.alt = 'Enhanced Face Image';
                genImg.style.maxWidth = '100%';
                genImg.style.height = 'auto';
                genImg.style.display = 'block';
                genImg.style.margin = '0 auto';
                generatedFrame.appendChild(genImg);

                // Add download button
                const downloadBtn = document.createElement('button');
                downloadBtn.id = 'downloadBtn';
                downloadBtn.textContent = 'Download Enhanced Face Image';
                downloadBtn.className = 'download-btn';
                downloadBtn.onclick = function() {
                    const link = document.createElement('a');
                    link.href = data.image;
                    link.download = 'enhanced_face.png';
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
    const videoBtn = document.createElement('button');
    videoBtn.textContent = 'Generate Video';
    videoBtn.className = 'video-btn';
    videoBtn.style.marginTop = '10px';
    videoBtn.style.marginRight = '10px';
    
    videoBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Prevent multiple submissions
        videoBtn.disabled = true;
        videoBtn.textContent = 'Generating Video...';
        
        // Collect form data
        const formData = new FormData();
        formData.append('prompt', promptBox.value);
        
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
            } else {
                generatedFrame.innerHTML = '<div class="loading-message">Error: ' + (data.error || 'Video generation failed') + '</div>';
            }
        } catch (err) {
            generatedFrame.innerHTML = '<div class="loading-message">Error: ' + err.message + '</div>';
        } finally {
            // Re-enable video button
            videoBtn.disabled = false;
            videoBtn.textContent = 'Generate Video';
        }
    });

    // Add the face and video buttons to the button container
    const buttonContainer = uploadForm.querySelector('.button-container');
    buttonContainer.appendChild(faceBtn);
    buttonContainer.appendChild(enhancedFaceBtn);
    buttonContainer.appendChild(videoBtn);
});