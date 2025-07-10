# Architectural Rendering Generator

A complete web application for generating architectural renderings and videos using AI. Upload multiple images (photos, sketches, 3D models) and provide text descriptions to create stunning architectural visualizations.

## Features

- **Multiple Image Upload**: Upload up to 3 images with different types (Photo, Sketch, 3D Image)
- **Image-to-Image Generation**: Use uploaded images as reference for AI generation
- **Text-to-Image Generation**: Generate images from text descriptions only
- **Video Generation**: Create short architectural videos
- **Download Results**: Download generated images and videos
- **Modern UI**: Clean, responsive interface

## Setup Instructions

### 1. Backend Setup (Required)

#### Option A: Deploy to Render.com (Recommended)
1. Create a new account on [Render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository or upload the backend files
4. Set environment variables:
   - `REPLICATE_API_TOKEN`: Your Replicate API token
5. Deploy the service

#### Option B: Run Locally
1. Install Node.js (version 18 or higher)
2. Navigate to the backend directory
3. Run `npm install`
4. Create a `.env` file with your Replicate API token:
   ```
   REPLICATE_API_TOKEN=your_token_here
   ```
5. Run `npm start`

### 2. Frontend Setup
1. Update the `BACKEND_URL` in `script.js` to point to your deployed backend
2. Open `index.html` in a web browser

### 3. Get Replicate API Token
1. Sign up at [Replicate.com](https://replicate.com)
2. Go to your account settings
3. Generate an API token
4. Add billing information (required for AI model usage)

## Usage

1. **Upload Images**: Select up to 3 images and choose their types
2. **Enter Description**: Describe your desired architectural rendering
3. **Generate**: Click "Submit" for images or "Generate Video" for videos
4. **Download**: Use the download button to save your results

## Technical Details

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Node.js, Express, Multer for file uploads
- **AI Models**: Replicate API with Stable Diffusion
- **File Support**: JPG, PNG, and other image formats
- **Video Generation**: Text-to-video using Stable Video Diffusion

## File Structure

```
├── index.html          # Main frontend file
├── style.css           # Styling
├── script.js           # Frontend JavaScript
├── server.js           # Backend server
├── package.json        # Backend dependencies
└── env.example         # Environment variables template
```

## Troubleshooting

- **CORS Errors**: Ensure your backend URL is correctly set in `script.js`
- **API Errors**: Check your Replicate API token and billing status
- **Upload Issues**: Ensure images are under 10MB and in supported formats
- **Generation Timeouts**: Video generation can take 3-5 minutes

## Cost Considerations

- Replicate charges per API call
- Image generation: ~$0.01-0.05 per image
- Video generation: ~$0.10-0.50 per video
- Set up billing limits in your Replicate account 