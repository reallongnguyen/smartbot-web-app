export interface IoTDevice<T = Record<string, any>> {
  id: string;
  spaceId: string;
  macAddress: string;
  chipId: string;
  name?: string;
  type: string;
  state: 'running' | 'stopped';
  connectStatus: string;
  version: string;
  firmwareVersion: string;
  switchBot?: T;
  sensor?: T;
}

export interface MeasurementValue {
  type: string;
  value: number;
}

export interface SensorData {
  lastMeasurementAt: string;
  measurements: MeasurementValue[];
}

export interface SwitchData {
  mode: 'switch' | 'button';
  state: 'on' | 'off' | 'press';
}

const lightToText = [
  'Dark',
  'Dark',
  'Dark',
  'Light',
  'Light',
  'Light',
  'Light',
  'Light',
  'Light',
  'Light',
  '-',
  '-',
  '-',
  '-',
  '-',
  '-',
  '-',
];

export const mapMeasurementValue: Record<string, any> = {
  temperature: {
    shortTitle: 'TEMP',
    suffix: '°C',
    getData: (v: number) => String(Math.round(v * 10) / 10),
    bgColor: 'rose',
  },
  humidity: {
    shortTitle: 'HUMI',
    suffix: '%',
    getData: (v: number) => String(Math.round(v * 10) / 10),
    bgColor: 'sky',
  },
  light: {
    shortTitle: 'LIGHT',
    suffix: '',
    getData: (v: number) => lightToText[v],
    bgColor: 'amber',
  },
};
