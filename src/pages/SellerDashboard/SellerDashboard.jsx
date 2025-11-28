import React, { useState, useEffect } from "react";
import SellerLayout from "./SellerLayout";
import KYCForm from "./KYCForm";
import SellerHub from "./SellerHub";

const SellerDashboard = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already a verified seller
    // For now, we'll use localStorage to simulate persistence
    const sellerStatus = localStorage.getItem("isSellerVerified");
    if (sellerStatus === "true") {
      setIsVerified(true);
    }
    setLoading(false);
  }, []);

  const handleKYCComplete = () => {
    localStorage.setItem("isSellerVerified", "true");
    setIsVerified(true);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!isVerified) {
    return <KYCForm onComplete={handleKYCComplete} />;
  }

  return (
    <SellerLayout>
      <SellerHub />
    </SellerLayout>
  );
};

export default SellerDashboard;
