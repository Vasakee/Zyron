import { ShippingStatus, Source } from 'src/enum';
import { DateTime } from 'luxon';
import { Order } from 'src/order/entity/order.entity';

export class CreateShippingDto {
  name: string;
  email: string;
  payment_intent: string;
  quantity: number;
  city: string;
  country: string;
  line1: string;
  line2: string;
  postal_code: string;
  state: string;

  public toEntity(payload: CreateShippingDto) {
    const data = new Order();
    data.firstName = payload.name.split(' ')[0];
    data.lastName = payload.name.split(' ')[1];
    data.lastName;
    data.email = payload.email;
    data.addressLineOne = payload.line1;
    data.addressLineTwo = payload.line2;
    data.city = payload.city;
    data.postalCode = payload.postal_code;
    data.state = payload.state;
    data.country = payload.country;
    data.referenceId = payload.payment_intent;
    data.quantity = payload.quantity;
    data.status = ShippingStatus.Paid;
    data.source = Source.Website;
    data.completedAt = DateTime.local().toJSDate();
    return data;
  }
}
