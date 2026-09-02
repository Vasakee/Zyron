import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class UsageSseBus {
  private subject = new Subject<{ type: string }>();
  emitCreated() {
    this.subject.next({ type: 'usage_created' });
  }
  stream() {
    return this.subject.asObservable();
  }
}
