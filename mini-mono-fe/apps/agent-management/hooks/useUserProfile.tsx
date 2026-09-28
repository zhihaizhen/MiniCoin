import { useState } from 'react';
import { getUserProfile } from '~/api';

const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const res = await getUserProfile();

      if (res.id) {
        setUserProfile(res);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return {
    userProfile,
    fetchUserProfile
  };
};

export default useUserProfile;
