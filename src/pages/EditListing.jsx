import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

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

function EditListing() {
  // eslint-disable-next-line
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [listing, setListing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();

  // Redirect if listing is not user's
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error('You do not have permission to edit that listing');
      navigate('/');
    }
  }, [listing, auth.currentUser.uid, navigate]);

  // Fetch listing to edit
  useEffect(() => {
    setLoading(true);

    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data(), address: docSnap.data().location });
      } else {
        toast.error('Listing does not exist');
        navigate('/');
      }

      setLoading(false);
    };

    fetchListing();
  }, [params.listingId, navigate]);

  // Sets userRef to logged in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      user
        ? setFormData({ ...initialFormState, userRef: user.uid })
        : navigate('/sign-in');
    });

    return unsubscribe;
  }, [auth, navigate]);

  const onMutate = (e) => {
    let boolean = null;

    if (e.target.value === 'true') {
      boolean = true;
    }

    if (e.target.value === 'false') {
      boolean = false;
    }

    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error('Discounted price needs to be less than regular price');
      return;
    }

    if (images.length > 6) {
      setLoading(false);
      toast.error('Max 6 images');
      return;
    }

    const apiKey = process.env.REACT_APP_GEOCODE_API_KEY;
    let geolocation = {};
    let location;

    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`
      );

      const data = await response.json();

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;
      location =
        data.status === 'ZERO_RESULTS'
          ? undefined
          : data.results[0]?.formatted_address; // formatted_address is not always reliable

      if (location === undefined || location.includes('undefined')) {
        setLoading(false);
        toast.error('Please enter a correct address');
        return;
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }

    // Store image in Firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, 'images/' + fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          'state_changed', // Called any time the state changes
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            console.log('Upload is ' + progress + '% done');

            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
              default:
                break;
            }
          },
          // Handle unsuccessful uploads
          (error) => {
            reject(error);
          },
          // Handle successful uploads on complete
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error('Images not uploaded');
      return;
    });

    // Object to be added to the database
    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };

    // Clean up formDataCopy before sending
    delete formDataCopy.images;
    delete formDataCopy.address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;
    formDataCopy.location = address; // Set location to address string that's typed in since formatted_address is not always reliable

    // Update listing in the database
    const docRef = doc(db, 'listings', params.listingId);
    await updateDoc(docRef, formDataCopy);

    setLoading(false);
    toast.success('Listing saved');

    // Navigate to the created listing page
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  if (loading) return <Spinner />;

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Edit Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              id='type'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              value='sale'
              onClick={onMutate}>
              Sell
            </button>
            <button
              type='button'
              id='type'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              value='rent'
              onClick={onMutate}>
              Rent
            </button>
          </div>

          <label className='formLabel'>Name</label>
          <input
            type='text'
            id='name'
            className='formInputName'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                type='number'
                id='bedrooms'
                className='formInputSmall'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                type='number'
                id='bathrooms'
                className='formInputSmall'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
          </div>

          <label className='formLabel'>Parking spot</label>
          <div className='formButtons'>
            <button
              type='button'
              id='parking'
              className={parking ? 'formButtonActive' : 'formButton'}
              value={true}
              onClick={onMutate}
              min='1'
              max='50'>
              Yes
            </button>
            <button
              type='button'
              id='parking'
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              type='button'
              id='furnished'
              className={furnished ? 'formButtonActive' : 'formButton'}
              value={true}
              onClick={onMutate}>
              Yes
            </button>
            <button
              type='button'
              id='furnished'
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>

          <label className='formLabel'>Address</label>
          <textarea
            type='text'
            id='address'
            className='formInputAddress'
            value={address}
            onChange={onMutate}
            required
          />

          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  type='number'
                  id='latitude'
                  className='formInputSmall'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  type='number'
                  id='longitude'
                  className='formInputSmall'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              type='button'
              id='offer'
              className={offer ? 'formButtonActive' : 'formButton'}
              value={true}
              onClick={onMutate}>
              Yes
            </button>
            <button
              type='button'
              id='offer'
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              type='number'
              id='regularPrice'
              className='formInputSmall'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                type='number'
                id='discountedPrice'
                className='formInputSmall'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            type='file'
            id='images'
            className='formInputFile'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditListing;
