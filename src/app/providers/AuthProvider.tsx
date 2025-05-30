import React, { ReactNode, useEffect } from 'react';
import { useAppDispatch } from '../../stores/hooks';
import { Me } from '../../api/api';
import { MyTeams } from '../../api/teamApi';
import { setAuthorized, setCurrentUserId, setTeams } from '../../stores/teamSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { routes } from '../App.routes';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dispatch(setAuthorized('loading'));
    Me()
      .then((userData) => {
        if (userData && userData.id) {
          const userId = Number(userData.id);
          dispatch(setCurrentUserId(userId));

          MyTeams()
            .then((res) => {
              if (res.teams) {
                dispatch(setTeams(res.teams));
                dispatch(setAuthorized('authorized'));
              }
            })
            .catch(() => {
              dispatch(setAuthorized('authorized'));
            });
        } else {
          dispatch(setTeams([]));
          dispatch(setCurrentUserId(0));
          dispatch(setAuthorized('not_authorized'));

          if (location.pathname === '/' || location.pathname === routes.root()) {
            navigate(routes.home());
          }
        }
      })
      .catch(() => {
        dispatch(setTeams([]));
        dispatch(setCurrentUserId(0));
        dispatch(setAuthorized('not_authorized'));

        if (location.pathname === '/' || location.pathname === routes.root()) {
          navigate(routes.home());
        }
      });
  }, [dispatch, navigate, location.pathname]);

  return <>{children}</>;
};
