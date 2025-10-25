# Code Ninjas Halloween Photo Booth Project

### Project Overview
This is a web-based photo booth application for Halloween events at Code Ninjas. The application consists of two main parts:
1. A registration form where parents/guardians can register their children
2. A photo booth interface that uses QR codes to identify registered users and capture photos

The application uses Firebase for data storage and can be hosted on GitHub Pages, making it easily accessible without need for a dedicated server.

### Features
- User registration with automatic QR code generation
- QR code scanning in photo booth interface
- Real-time data storage using Firebase
- Photo capture with built-in camera access
- QR code detection in captured photos
- Admin dashboard for viewing registrations

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/theLittleBigZ/Code-Ninjas-Halloween-project.git
cd Code-Ninjas-Halloween-project
```

2. Install dependencies:
```bash
npm install
```

3. Firebase Configuration:
The project uses Firebase for data storage. The configuration is already set up in `public/firebase-config.js`. If you need to use your own Firebase project:

   a. Create a new project in [Firebase Console](https://console.firebase.google.com/)
   b. Enable Realtime Database
   c. Update the configuration in `public/firebase-config.js`

4. Deploy to GitHub Pages:
   a. Push your changes to GitHub
   b. Go to your repository settings
   c. Navigate to "Pages" under "Code and automation"
   d. Under "Source", select "Deploy from a branch"
   e. Select your main branch and set the directory to "/" (root)
   f. Click "Save"
   g. Wait a few minutes for the deployment to complete
   h. Your site will be available at `https://<username>.github.io/<repository-name>`

### Usage

#### Registration Form
1. Open the registration page
2. Fill in the required information:
   - Parent/guardian first name
   - Parent/guardian last name
   - Parent/guardian email
   - Phone number (optional)
   - Postal code
   - Number of photos
   - Children's names
   - Children's ages
3. Submit the form to receive a QR code

#### Photo Booth Interface
1. Open the photo booth page
2. Use the camera to scan a user's QR code
3. Once verified:
   - The system will show the registration details
   - Allow photo capture
   - Process the photo
   - Save to Firebase storage

#### Admin Dashboard
1. Access the admin page at `/db-viewer.html`
2. View all registrations in real-time
3. Use the search filter to find specific registrations

### Project Structure
```
├── index.html           # Registration page
├── photobooth.html     # Photo booth interface
├── db-viewer.html      # Admin dashboard
├── script.js           # Main JavaScript file
├── firebase-config.js  # Firebase configuration
├── style.css          # Shared styles
└── .nojekyll          # Prevents GitHub Pages from using Jekyll
```

### Security Considerations
- The Firebase configuration is public but restricted by security rules
- Admin access should be protected in production
- QR codes contain unique UUIDs for user identification

### Development
To run the project locally:
1. Clone the repository
2. Open `public/index.html` in a web browser
3. No local server is required as it's purely client-side

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### License
See the [LICENSE](LICENSE) file for details.
