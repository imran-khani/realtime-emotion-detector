// Required Firestore composite indexes for emotion tracking

// Add these indexes in Firebase Console > Firestore > Indexes

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

// Firestore Security Rules
export const securityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User can only access their own emotion data
    match /user_emotions/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // User can only access their own sessions
    match /sessions/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // User can only access their own stats
    match /user_stats/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
`;
