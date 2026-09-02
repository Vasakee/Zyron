import { Kit } from 'src/kit/entity/kit.entity';
import { PractitionerKit } from 'src/kit/entity/practitioner-kits.entity';

export function findLatestKit(kit: Kit[]) {
  return kit.reduce((latestItem, currentItem) => {
    if (currentItem.createdAt > (latestItem ? latestItem.createdAt : 0)) {
      return currentItem;
    } else {
      return latestItem;
    }
  }, null);
}


export function findLatestPractitionerKit(kit: PractitionerKit[]) {
  return kit.reduce((latestItem, currentItem) => {
    if (currentItem.createdAt > (latestItem ? latestItem.createdAt : 0)) {
      return currentItem;
    } else {
      return latestItem;
    }
  }, null);
}

