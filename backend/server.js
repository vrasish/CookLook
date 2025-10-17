const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'https://vrasish.github.io', 
    'https://cook-look.vercel.app',
    'http://localhost:3000', 
    'http://127.0.0.1:5500'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.1',
    openai_configured: !!process.env.OPENAI_API_KEY,
    openai_key_length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
  });
});

// OpenAI Vision API endpoint
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    console.log('🔍 Received image analysis request');
    console.log('🔑 OpenAI API Key configured:', !!process.env.OPENAI_API_KEY);
    
    if (!req.file) {
      console.log('❌ No image file provided');
      return res.status(400).json({ 
        error: 'No image file provided',
        success: false 
      });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey || openaiApiKey === 'your-openai-api-key-here') {
      console.log('❌ OpenAI API key not configured');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        success: false,
        fallback: 'Please configure OPENAI_API_KEY in environment variables'
      });
    }

    // Convert image to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    console.log('🤖 Calling OpenAI Vision API...');
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Look at this image and identify the main vegetable or food item. Be very specific about the type. For peppers, specify the color (e.g., 'green bell pepper', 'red bell pepper', 'yellow bell pepper'). For other vegetables, use the common name (e.g., 'carrot', 'tomato', 'potato', 'broccoli', 'onion', 'lettuce', 'cucumber', 'cabbage', 'spinach', 'kale', 'celery', 'radish', 'beetroot', 'sweet potato', 'green beans', 'asparagus', 'cauliflower'). Respond with only the vegetable name in lowercase. If you see multiple items, identify the most prominent one."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error('Invalid OpenAI API response format');
    }

    const detectedItem = response.data.choices[0].message.content.trim().toLowerCase();
    
    // Clean up the response to get just the vegetable name
    console.log('🔍 Raw AI response:', detectedItem);
    
    const vegetables = [
      'green bell pepper', 'red bell pepper', 'yellow bell pepper', 'orange bell pepper',
      'carrot', 'tomato', 'potato', 'broccoli', 'onion', 'lettuce', 'cucumber', 
      'cabbage', 'spinach', 'kale', 'celery', 'radish', 'beetroot', 'sweet potato', 
      'green beans', 'asparagus', 'cauliflower', 'pepper'
    ];
    
    // Try exact matches first (for specific peppers)
    let finalVegetable = null;
    for (const veg of vegetables) {
      if (detectedItem.includes(veg)) {
        finalVegetable = veg;
        break;
      }
    }
    
    // If no match found, try to extract just the main vegetable name
    if (!finalVegetable) {
      const simpleVegetables = ['carrot', 'tomato', 'potato', 'broccoli', 'onion', 'lettuce', 'cucumber', 'cabbage', 'spinach', 'kale', 'celery', 'radish', 'beetroot', 'pepper'];
      for (const veg of simpleVegetables) {
        if (detectedItem.includes(veg)) {
          finalVegetable = veg;
          break;
        }
      }
    }
    
    if (!finalVegetable) {
      finalVegetable = detectedItem; // Return raw response if no match
    }

    console.log('✅ Final detection result:', finalVegetable);

    res.json({
      success: true,
      detectedIngredient: finalVegetable,
      confidence: 'high',
      method: 'openai-vision',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error analyzing image:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to analyze image',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Spoonacular API proxy for recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const { ingredients, cuisine, diet, type } = req.query;
    
    if (!ingredients) {
      return res.status(400).json({ 
        error: 'Ingredients parameter is required',
        success: false 
      });
    }

    const spoonKey = process.env.SPOON_KEY || 'd774b10f22674128a2db72604dd1d5ed';
    
    console.log('🍽️ Fetching recipes for ingredients:', ingredients);
    
    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        ingredients: ingredients,
        number: 12,
        limitLicense: true,
        ranking: 2,
        ignorePantry: false
      },
      headers: {
        'x-api-key': spoonKey
      }
    });

    // Get detailed recipe information
    const recipeIds = response.data.map(recipe => recipe.id).join(',');
    const detailsResponse = await axios.get(`https://api.spoonacular.com/recipes/informationBulk`, {
      params: {
        ids: recipeIds
      },
      headers: {
        'x-api-key': spoonKey
      }
    });

    res.json({
      success: true,
      recipes: detailsResponse.data,
      count: detailsResponse.data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching recipes:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recipes',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CookLook Backend Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Image analysis: http://localhost:${PORT}/api/analyze-image`);
  console.log(`🍽️ Recipe search: http://localhost:${PORT}/api/recipes`);
  console.log(`🔑 OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
});

module.exports = app;
