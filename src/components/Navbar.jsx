import { NavLink } from 'react-router-dom';

import { ReactComponent as OfferIcon } from '../assets/svg/localOfferIcon.svg';
import { ReactComponent as ExploreIcon } from '../assets/svg/exploreIcon.svg';
import { ReactComponent as PersonOutlineIcon } from '../assets/svg/personOutlineIcon.svg';

function Navbar() {
  return (
    <footer className='navbar'>
      <nav className='navbarNav'>
        <ul className='navbarListItems'>
          <li>
            <NavLink to='/' className='navbarListItemLink'>
              <ExploreIcon fill='#8f8f8f' width='36px' height='36px' />
              <p className='navbarListItemName'>Explore</p>
            </NavLink>
          </li>
          <li>
            <NavLink to='/offers' className='navbarListItemLink'>
              <OfferIcon fill='#8f8f8f' width='36px' height='36px' />
              <p className='navbarListItemName'>Offers</p>
            </NavLink>
          </li>
          <li>
            <NavLink to='/profile' className='navbarListItemLink'>
              <PersonOutlineIcon fill='#8f8f8f' width='36px' height='36px' />
              <p className='navbarListItemName'>Profile</p>
            </NavLink>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

export default Navbar;
