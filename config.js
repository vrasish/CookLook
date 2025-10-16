// Configuration file for CookLook app
const CONFIG = {
  // API Configuration
  HUGGING_FACE_API_KEY: "YOUR_HF_API_KEY",
  SPOONACULAR_API_KEY: "d774b10f22674128a2db72604dd1d5ed",
  
  // App Configuration
  APP_NAME: "CookLook",
  APP_VERSION: "1.0.0",
  
  // Camera Configuration
  CAMERA: {
    WIDTH: { ideal: 1280 },
    HEIGHT: { ideal: 720 },
    FACING_MODE: 'environment'
  },
  
  // AI Model Configuration
  AI_MODEL: {
    ENDPOINT: "https://api-inference.huggingface.co/models/keremberke/food-image-classification",
    CONFIDENCE_THRESHOLD: 0.2,
    MAX_INGREDIENTS: 3
  },
  
  // Recipe Configuration
  RECIPES: {
    MAX_RECIPES: 3,
    API_ENDPOINT: "https://api.spoonacular.com/recipes/findByIngredients"
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
