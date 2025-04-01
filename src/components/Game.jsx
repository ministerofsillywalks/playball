import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchGame, selectGame, selectSelectedId, selectFullUpdateRequired } from '../features/games.js';

import PreviewGame from './PreviewGame.js';
import LiveGame from './LiveGame.js';
import FinishedGame from './FinishedGame.js';

import log from '../logger.js';

function Game() {
  const dispatch = useDispatch();
  const game = useSelector(selectGame);
  const fullUpdateRequired = useSelector(selectFullUpdateRequired);
  const id = useSelector(selectSelectedId);
  const timerRef = useRef(null);
  const timestampRef = useRef();
  timestampRef.current = fullUpdateRequired ? null : game?.metaData?.timeStamp;

  const updateGameData = () => {
    dispatch(fetchGame({id, start: timestampRef.current}))
      .unwrap()
      .then((result) => {
        const wait = ((result && result.metaData?.wait) || 10) * 1000;
        timerRef.current = setTimeout(updateGameData, wait);
      })
      .catch(err => log.error('UPDATE_GAME_DATA:\n' + JSON.stringify(err) + '\n' + err.stack));
  };

  useEffect(() => {
    updateGameData();
    return () => {
      clearTimeout(timerRef.current);
    };
  }, [id]);

  if (!game) { 
    return <element />;
  }

  let Wrapped = null;
  switch (game.gameData?.status?.abstractGameCode) {
  case 'P':
    Wrapped = PreviewGame;
    break;
  case 'L':
    Wrapped = LiveGame;
    break;
  case 'F':
    Wrapped = LiveGame;
    break;
  }

  return (
    <element><Wrapped /></element>
  );
}

export default Game;
