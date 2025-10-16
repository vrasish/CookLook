// Main application logic for CookLook
class CookLookApp {
  constructor() {
    this.initializeApp();
  }

  initializeApp() {
    console.log("🍳 CookLook app initialized!");
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Additional app-specific event listeners can be added here
    console.log("📱 Event listeners setup complete");
  }

  // Utility method to show notifications
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '10px',
      color: 'white',
      fontWeight: '600',
      zIndex: '10000',
      maxWidth: '300px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    });

    // Set background color based on type
    const colors = {
      'success': '#00b874',
      'error': '#dc3545',
      'warning': '#ffc107',
      'info': '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cookLookApp = new CookLookApp();
});
