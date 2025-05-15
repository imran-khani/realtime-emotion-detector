// Required Firestore composite indexes
// Add these in Firebase Console > Firestore > Indexes

export const requiredIndexes = [
  {
    collectionId: "user_emotions",
    fields: [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "timestamp", order: "DESCENDING" }
    ]
  },
  {
    collectionId: "sessions",
    fields: [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "startTime", order: "DESCENDING" }
    ]
  }
];

// Firestore Security Rules - UPDATE THESE IN FIREBASE CONSOLE
export const securityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // User emotions - only authenticated users can read/write their own data
    match /user_emotions/{document=**} {
      allow read: if isAuthenticated() && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Sessions - only authenticated users can access their own sessions
    match /sessions/{document=**} {
      allow read: if isAuthenticated() && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // User stats - stored by userId
    match /user_stats/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
`;

// Instructions for setting up Firebase
export const setupInstructions = `
1. Go to Firebase Console > Firestore Database
2. Click on "Rules" tab
3. Replace existing rules with the rules above
4. Click "Publish"

5. Go to "Indexes" tab
6. Click "Create Index"
7. Add indexes for:
   - Collection: user_emotions
   - Fields: userId (Ascending), timestamp (Descending)
   
   - Collection: sessions  
   - Fields: userId (Ascending), startTime (Descending)

8. Wait for indexes to build (few minutes)
`;
