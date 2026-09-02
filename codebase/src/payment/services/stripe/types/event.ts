import { ChargeType } from "./charge-succeeded";

export type EventType = {
    id: string;
    object: string;
    api_version: string;
    created: number;
    data: {
      object: ChargeType;
    };
    livemode: boolean;
    pending_webhooks: number;
    request: {
      id: string;
      idempotency_key: string;
    };
    type: string;
  };