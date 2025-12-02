import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Container, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUserData(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, navigate, baseUrl]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: '600px' }}>
        <h2 className="mb-4">My Profile</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Card className="shadow">
          <Card.Body>
            {userData ? (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4>{userData.name || 'User'}</h4>
                    <p className="text-muted mb-0">{userData.email}</p>
                  </div>
                  <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" 
                       style={{ width: '80px', height: '80px' }}>
                    <span className="text-white display-5">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5>Account Information</h5>
                  <hr className="my-2" />
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Name:</strong></p>
                      <p>{userData.name || 'Not provided'}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Email:</strong></p>
                      <p>{userData.email}</p>
                    </div>
                  </div>
                  {userData.phone && (
                    <div>
                      <p className="mb-1"><strong>Phone:</strong></p>
                      <p>{userData.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p>No user data available</p>
            )}
            
            <div className="d-grid gap-2 mt-4">
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/profile/edit')}
                disabled={!userData}
              >
                Edit Profile
              </Button>
              
              <Button 
                variant="outline-danger" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Profile;
