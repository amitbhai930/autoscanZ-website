// Navigation Map
const navMap = {
  home: {
    label: 'Home',
    page: 'pages/home.html',
    children: [
      {
        label: 'Features',
        page: 'pages/features.html'
      },
      {
        label: 'Scan Tool',
        page: 'pages/scan.html',
        children: [
          {
            label: 'Results',
            page: 'pages/results.html'
          }
        ]
      },
      {
        label: 'About',
        page: 'pages/about.html'
      },
      {
        label: 'Contact',
        page: 'pages/contact.html'
      }
    ]
  }
};

// Navigation function
function navigate(page) {
  fetch(page)
    .then(response => response.text())
    .then(html => {
      document.getElementById('content').innerHTML = html;
    })
    .catch(error => console.error('Navigation error:', error));
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', function() {
  // Load home page by default
  navigate(navMap.home.page);
});