export type ISODateString = string;

export type SelectOption<TValue extends string = string> = {
  label: string;
  value: TValue;
};
