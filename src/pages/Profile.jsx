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
        const response = await axios.get(`${baseUrl}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data) {
          setUserData({
            ...response.data,
            // Map any fields if needed
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again later.');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
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
                    <h4>{userData.firstName} {userData.lastName}</h4>
                    <p className="text-muted mb-0">{userData.email}</p>
                    {userData.isASeller && <span className="badge bg-success">Seller</span>}
                    {userData.emailConfirm ? (
                      <span className="badge bg-success ms-2">Email Verified</span>
                    ) : (
                      <span className="badge bg-warning text-dark ms-2">Email Not Verified</span>
                    )}
                  </div>
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" 
                       style={{ width: '80px', height: '80px' }}>
                    <span className="text-white display-5">
                      {userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5>Account Information</h5>
                  <hr className="my-2" />
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>First Name:</strong></p>
                      <p>{userData.firstName || 'Not provided'}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Last Name:</strong></p>
                      <p>{userData.lastName || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-12">
                      <p className="mb-1"><strong>Email:</strong></p>
                      <p>{userData.email}</p>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-12">
                      <p className="mb-1"><strong>Address:</strong></p>
                      <p>{userData.address || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Account Type:</strong></p>
                      <p>{userData.isASeller ? 'Seller' : 'Buyer'}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Email Status:</strong></p>
                      <p>{userData.emailConfirm ? 'Verified' : 'Not Verified'}</p>
                    </div>
                  </div>
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
