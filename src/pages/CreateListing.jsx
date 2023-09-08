import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import Spinner from '../components/Spinner';

// Declaring outside of the component guarantees it doesn't change and so stays the same Object reference in memory and won't trigger a useEffect
const initialFormState = {
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
};

function CreateListing() {
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      user
        ? setFormData({ ...initialFormState, userRef: user.uid })
        : navigate('/sign-in');
    });

    return unsubscribe;
  }, [auth, navigate]);

  if (loading) return <Spinner />;

  return <div>CreateListing</div>;
}

export default CreateListing;
