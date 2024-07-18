import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase"; // Ensure storage is imported from firebase
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Container, Row, Col, Image, Form, Button } from "react-bootstrap";

export default function Profile({ onProfilePicChange }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserData(userData);
          if (userData.profilePicUrl) {
            setProfilePicUrl(userData.profilePicUrl);
            onProfilePicChange(userData.profilePicUrl);
          } else if (currentUser.providerData[0].providerId === "google.com") {
            const googleProfilePicUrl = currentUser.photoURL;
            setProfilePicUrl(googleProfilePicUrl);
            onProfilePicChange(googleProfilePicUrl);
            await updateDoc(doc(db, "users", currentUser.uid), {
              profilePicUrl: googleProfilePicUrl,
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [onProfilePicChange]);

  const handleProfilePicChange = (e) => {
    if (e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

  const handleUploadProfilePic = async () => {
    try {
      if (profilePic && user) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}/${profilePic.name}`);
        await uploadBytes(storageRef, profilePic);
        const url = await getDownloadURL(storageRef);
        setProfilePicUrl(url);
        await updateDoc(doc(db, "users", user.uid), {
          profilePicUrl: url,
        });
        setProfilePic(null);
        onProfilePicChange(url);
      } else {
        console.error("No profile picture selected or user not signed in!");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const formatSignupDate = (signupDate) => {
    if (!signupDate) return "N/A";
    if (signupDate.toDate) {
      return new Date(signupDate.toDate()).toLocaleDateString();
    }
    if (signupDate.seconds) {
      return new Date(signupDate.seconds * 1000).toLocaleDateString();
    }
    return new Date(signupDate).toLocaleDateString();
  };

  return (
    <Container>
      <Row className="mt-5 justify-content-center">
        <Col xs={12} md={6} className="text-center">
          <h1>Profile</h1>
          <Image src={profilePicUrl || "default_profile_pic_url"} roundedCircle className="mb-3" width="200" height="200" />
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Upload Profile Picture</Form.Label>
            <Form.Control type="file" onChange={handleProfilePicChange} />
          </Form.Group>
          <Button variant="primary" onClick={handleUploadProfilePic}>Upload</Button>
        </Col>
        <Col xs={12} md={6}>
          <h2>User Information</h2>
          {userData && user ? (
            <>
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Phone:</strong> {userData.phone}</p>
              <p><strong>Department:</strong> {userData.department}</p>
              <p><strong>Module:</strong> {userData.module}</p>
              <p><strong>Signup Date:</strong> {formatSignupDate(userData.signupDate)}</p>
              <p><strong>User ID:</strong> {user.uid}</p>
              <p><strong>Role: </strong>{userData.role}</p>
            </>
          ) : (
            <p>Loading user information...</p>
          )}
        </Col>
      </Row>
    </Container>
  );
}
