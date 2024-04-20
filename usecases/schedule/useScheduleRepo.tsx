import { useCallback } from 'react';
import { Schedule } from './model';
import { useAuthSession } from '../auth/AuthContext';
import { useSupabase } from '../supabase/SupabaseContex';
import { toCamelCaseArr } from '../common/utils';
import { APIError, APIResult, FailResult } from '../common/resultModel';
import { message } from 'antd';

export type CreateScheduleDTO = Pick<
  Schedule,
  'id' | 'action' | 'schedule' | 'deviceId' | 'isRepeat'
>;

const useScheduleRepo = () => {
  const authSession = useAuthSession();
  const spb = useSupabase();

  const getSchedulesByDeviceId = useCallback(
    async (deviceId: string) => {
      if (!authSession || !spb) {
        return {
          error: { message: 'not auth' },
        } as APIResult<Schedule[]>;
      }

      const { data: schedules, error } = await spb
        .from('schedules')
        .select(
          'id, device_id, schedule, action, is_repeat, last_ran_at, created_at, updated_at'
        )
        .eq('device_id', deviceId);

      return {
        data: schedules ? toCamelCaseArr<Schedule>(schedules) : undefined,
        error: error ? error : undefined,
      } as APIResult<Schedule[]>;
    },
    [authSession, spb]
  );

  const addOneSchedule = useCallback(
    async (data: CreateScheduleDTO) => {
      if (!authSession || !spb) {
        return {
          error: { message: 'not auth' },
        } as APIResult<Schedule>;
      }

      const { data: schedules, error } = await spb
        .from('schedules')
        .insert([
          {
            id: data.id,
            device_id: data.deviceId,
            schedule: data.schedule,
            action: data.action,
            is_repeat: data.isRepeat,
          },
        ])
        .select();

      return {
        data: schedules ? toCamelCaseArr<Schedule>(schedules)[0] : undefined,
        error: error ? error : undefined,
      } as APIResult<Schedule>;
    },
    [authSession, spb]
  );

  const deleteSchedules = useCallback(
    async (ids: string[]) => {
      if (!authSession || !spb) {
        return {
          error: { message: 'not auth' },
        } as APIResult<{}>;
      }

      const { error } = await spb.from('schedules').delete().in('id', ids);

      return { data: {}, error: error ? error : undefined } as APIResult<{}>;
    },
    [authSession, spb]
  );

  return {
    getSchedulesByDeviceId,
    addOneSchedule,
    deleteSchedules,
  };
};

export default useScheduleRepo;
