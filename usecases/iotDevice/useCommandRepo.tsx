import { useCallback, useMemo } from 'react';
import { useAuthSession } from '../auth/AuthContext';
import usePubSub from '../pubsub/PubSubContext';
import { ulid } from 'ulid';

const useCommandRepo = () => {
  const authSession = useAuthSession();
  const spaceId = authSession?.spaceId!;
  const userId = authSession?.userId!;

  const pubsub = usePubSub();

  const turnOnSwitchBot = useCallback(
    (deviceId: string) => {
      pubsub?.publishCommand(spaceId, deviceId, {
        id: ulid(),
        requesterId: userId,
        command: 'on',
        type: 'functional',
      });
    },
    [pubsub, spaceId, userId]
  );

  const turnOffSwitchBot = useCallback(
    (deviceId: string) => {
      pubsub?.publishCommand(spaceId, deviceId, {
        id: ulid(),
        requesterId: userId,
        command: 'off',
        type: 'functional',
      });
    },
    [pubsub, spaceId, userId]
  );

  const repo = useMemo(
    () => ({
      turnOnSwitchBot,
      turnOffSwitchBot,
    }),
    [turnOffSwitchBot, turnOnSwitchBot]
  );

  return repo;
};

export default useCommandRepo;
