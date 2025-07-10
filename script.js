document.addEventListener('DOMContentLoaded', function() {
    // Backend URL - update this when you deploy to Render.com
    const BACKEND_URL = 'http://localhost:3000'; // Change this to your deployed URL
    
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
                generatedFrame.innerHTML = '';
                const genImg = document.createElement('img');
                genImg.src = data.image;
                genImg.alt = 'Generated Rendering';
                genImg.style.maxWidth = '100%';
                genImg.style.height = 'auto';
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
                generatedFrame.innerHTML = '';
                const video = document.createElement('video');
                video.src = data.video;
                video.controls = true;
                video.style.maxWidth = '100%';
                video.style.height = 'auto';
                generatedFrame.appendChild(video);

                // Add download button
                const downloadBtn = document.createElement('button');
                downloadBtn.id = 'downloadBtn';
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
        }
    });

    // Add the video button to the form
    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    submitBtn.parentNode.insertBefore(videoBtn, submitBtn);
});