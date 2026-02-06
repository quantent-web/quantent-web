export type MagicBentoVariant = '2' | '3' | '4' | '6' | '8';

type MagicBentoConfig = {
  enableByDefault: boolean;
  disabledSections: string[];
  perSectionVariant: Record<string, MagicBentoVariant>;
};

export const magicBentoConfig: MagicBentoConfig = {
  enableByDefault: true,
  disabledSections: [],
  perSectionVariant: {},
};
