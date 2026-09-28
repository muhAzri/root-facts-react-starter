import { useReducer, useMemo } from 'react';
import type { CameraService } from '../services/CameraService';
import type { DetectionService } from '../services/DetectionService';
import type { RootFactsService } from '../services/RootFactsService';
import type { AppStateName, DetectionResult, FunFactData } from '../types';

export interface AppServices {
  detector: DetectionService | null;
  camera: CameraService | null;
  generator: RootFactsService | null;
}

interface AppReducerState {
  appState: AppStateName;
  isRunning: boolean;
  modelStatus: string;
  detectionResult: DetectionResult | null;
  funFactData: FunFactData;
  error: string | null;
  services: AppServices;
}

const initialState: AppReducerState = {
  appState: 'idle',
  isRunning: false,
  modelStatus: 'Memuat Model AI...',
  detectionResult: null,
  funFactData: null,
  error: null,
  services: {
    detector: null,
    camera: null,
    generator: null,
  },
};

const ActionTypes = {
  SET_MODEL_STATUS: 'SET_MODEL_STATUS',
  SET_SERVICES: 'SET_SERVICES',
  SET_RUNNING: 'SET_RUNNING',
  SET_APP_STATE: 'SET_APP_STATE',
  SET_DETECTION_RESULT: 'SET_DETECTION_RESULT',
  SET_FUN_FACT_DATA: 'SET_FUN_FACT_DATA',
  SET_ERROR: 'SET_ERROR',
  RESET_RESULTS: 'RESET_RESULTS',
} as const;

type AppAction =
  | { type: typeof ActionTypes.SET_MODEL_STATUS; payload: string }
  | { type: typeof ActionTypes.SET_SERVICES; payload: AppServices }
  | { type: typeof ActionTypes.SET_RUNNING; payload: boolean }
  | { type: typeof ActionTypes.SET_APP_STATE; payload: AppStateName }
  | { type: typeof ActionTypes.SET_DETECTION_RESULT; payload: DetectionResult | null }
  | { type: typeof ActionTypes.SET_FUN_FACT_DATA; payload: FunFactData }
  | { type: typeof ActionTypes.SET_ERROR; payload: string | null }
  | { type: typeof ActionTypes.RESET_RESULTS };

function appReducer(state: AppReducerState, action: AppAction): AppReducerState {
  switch (action.type) {
  case ActionTypes.SET_MODEL_STATUS:
    return { ...state, modelStatus: action.payload };

  case ActionTypes.SET_SERVICES:
    return { ...state, services: action.payload };

  case ActionTypes.SET_RUNNING:
    return { ...state, isRunning: action.payload };

  case ActionTypes.SET_APP_STATE:
    return { ...state, appState: action.payload };

  case ActionTypes.SET_DETECTION_RESULT:
    return { ...state, detectionResult: action.payload };

  case ActionTypes.SET_FUN_FACT_DATA:
    return { ...state, funFactData: action.payload };

  case ActionTypes.SET_ERROR:
    return { ...state, error: action.payload };

  case ActionTypes.RESET_RESULTS:
    return {
      ...state,
      appState: 'idle',
      detectionResult: null,
      funFactData: null,
      error: null,
    };

  default:
    return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = useMemo(
    () => ({
      setModelStatus: (status: string) =>
        dispatch({ type: ActionTypes.SET_MODEL_STATUS, payload: status }),

      setServices: (services: AppServices) =>
        dispatch({ type: ActionTypes.SET_SERVICES, payload: services }),

      setRunning: (isRunning: boolean) =>
        dispatch({ type: ActionTypes.SET_RUNNING, payload: isRunning }),

      setAppState: (appState: AppStateName) =>
        dispatch({ type: ActionTypes.SET_APP_STATE, payload: appState }),

      setDetectionResult: (result: DetectionResult | null) =>
        dispatch({ type: ActionTypes.SET_DETECTION_RESULT, payload: result }),

      setFunFactData: (data: FunFactData) =>
        dispatch({ type: ActionTypes.SET_FUN_FACT_DATA, payload: data }),

      setError: (error: string | null) =>
        dispatch({ type: ActionTypes.SET_ERROR, payload: error }),

      resetResults: () =>
        dispatch({ type: ActionTypes.RESET_RESULTS }),
    }),
    [],
  );

  return { state, actions };
}
