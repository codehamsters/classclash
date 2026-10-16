export type BoardProps<S = any, M = any> = {
  s: S;
  /** my seat, or -1 when watching */
  me: number;
  act: (m: M) => void;
  /** chalk colour and name per seat */
  colors: string[];
  names: string[];
};
