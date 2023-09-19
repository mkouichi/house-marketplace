import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../firebase.config';

import Spinner from '../components/Spinner';
import LisingItem from '../components/ListingItem';

function Category() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);
  const [noMoreListings, setNoMoreListings] = useState(false);

  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Get reference
        const listingsRef = collection(db, 'listings');

        // Create a query
        const q = query(
          listingsRef,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        // Execute query
        const querySnap = await getDocs(q);
        const tempListings = [];
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];

        setLastFetchedListing(lastVisible);
        setNoMoreListings(querySnap.empty);

        querySnap.forEach((doc) => {
          tempListings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(tempListings);
      } catch (error) {
        console.log(error);
        toast.error('Could not fetch listings');
      }

      setLoading(false);
    };

    fetchListings();
  }, [params.categoryName]);

  // Pagination / Load More
  const onFetchMoreListings = async () => {
    try {
      // Get reference
      const listingsRef = collection(db, 'listings');

      // Create a query
      const q = query(
        listingsRef,
        where('type', '==', params.categoryName),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchedListing),
        limit(10)
      );

      // Execute query
      const querySnap = await getDocs(q);
      const tempListings = [];
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];

      setLastFetchedListing(lastVisible);
      setNoMoreListings(querySnap.empty);

      querySnap.forEach((doc) => {
        tempListings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings((prevState) => [...prevState, ...tempListings]);
    } catch (error) {
      console.log(error);
      toast.error('Could not fetch listings');
    }
    setLoading(false);
  };

  return (
    <div className='category'>
      <header>
        <p className='pageHeader'>Places for {params.categoryName}</p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className='categoryListings'>
              {listings.map((listing) => (
                <LisingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </main>

          <br />
          <br />

          {noMoreListings ? (
            <p>No More Listings</p>
          ) : (
            <p className='loadMore' onClick={onFetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>No listings for {params.categoryName} yet</p>
      )}
    </div>
  );
}

export default Category;
