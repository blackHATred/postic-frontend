import React, { useEffect } from 'react';
import ButtonHeader from '../../widgets/Header/Header';
import { useAppDispatch } from '../../../stores/hooks';
import MainContainer from '../MainContainer/MainContainer';
import styles from './styles.module.scss';
import { Team } from '../../../models/Team/types';
import { MyTeams } from '../../../api/teamApi';
import { setAuthorized, setCurrentUserId, setTeams } from '../../../stores/teamSlice';
import { Me } from '../../../api/api';
const MainPage: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAuthorized('loading'));
    Me()
      .then((userData) => {
        if (userData && userData.user_id) {
          const userId = Number(userData.user_id);
          dispatch(setCurrentUserId(userId));

          MyTeams()
            .then((res: { teams: Team[] }) => {
              if (res.teams) {
                dispatch(setTeams(res.teams));
                dispatch(setAuthorized('authorized'));
              }
            })
            .catch(() => {
              console.log('Error getting teams');
              dispatch(setAuthorized('authorized'));
            });
        } else {
          dispatch(setAuthorized('not_authorized'));
        }
      })
      .catch((error) => {
        dispatch(setAuthorized('not_authorized'));
      });
  }, [dispatch]);

  return (
    <div className={styles['main-page']}>
      <ButtonHeader />

      <MainContainer />
    </div>
  );
};

export default MainPage;
