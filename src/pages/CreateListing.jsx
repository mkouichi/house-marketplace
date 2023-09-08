import { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import Spinner from '../components/Spinner';

function CreateListing() {
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: [],
    latituude: 0,
    longitude: 0,
  });

  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted &&
      onAuthStateChanged(auth, (user) => {
        user
          ? setFormData({ ...formData, userRef: user.uid })
          : navigate('/sign-in');
      });

    return () => (isMounted.current = false);
  }, [isMounted]);

  if (loading) return <Spinner />;

  return <div>CreateListing</div>;
}

export default CreateListing;
