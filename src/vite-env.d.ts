/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BOOKING_PROVIDER?: string;
  readonly VITE_BOOKING_LINK?: string;
  readonly VITE_PAYMENT_PROVIDER?: string;
  readonly VITE_STRIPE_LINK_CASA_AURELIA?: string;
  readonly VITE_STRIPE_LINK_RIDGE_HOUSE?: string;
  readonly VITE_STRIPE_LINK_VILLA_17?: string;
  readonly VITE_STRIPE_LINK_GLASS_HOUSE?: string;
  readonly VITE_STRIPE_LINK_DEFAULT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
