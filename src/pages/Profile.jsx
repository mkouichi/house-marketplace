import { useState } from 'react';
import { getAuth, updateProfile, updateEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate, redirect, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import homeIcon from '../assets/svg/homeIcon.svg';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';

const auth = getAuth();

function Profile() {
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const { name, email } = formData;

  const navigate = useNavigate();

  const onLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        // Update in Firebase Auth
        await updateProfile(auth.currentUser, { displayName: name });
      }

      if (auth.currentUser.email !== email) {
        // Update in Firebase Auth
        await updateEmail(auth.currentUser, email);
      }

      // Update in Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);

      await updateDoc(userRef, { name, email });

      toast.success('Successfully updated your profile');
    } catch (error) {
      console.log(error);
      toast.error('Could not update profile datails');
    }
  };

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button type='button' className='logOut' onClick={onLogout}>
          Log out
        </button>
      </header>

      <main>
        <div className='profileDetailsHeader'>
          <p className='profileDetailsText'>Personal Details</p>
          <p
            className='changePersonalDetails'
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}>
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>

        <div className='profileCard'>
          <form>
            <input
              type='text'
              id='name'
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type='email'
              id='email'
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>

        <Link to='/create-listing' className='createListing'>
          <img src={homeIcon} alt='home' />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt='arrow right' />
        </Link>
      </main>
    </div>
  );
}

// If user is signed out, redirect to sign in page
export const loader = () => {
  return !auth.currentUser ? redirect('/sign-in') : null;
};

export default Profile;
