import { PublicBusinessHours } from "../../public-business-profile-view";
import type { BusinessHoursEntry } from "../../../../db/business-hours-rules";

export function HoursModule({ hours }: { hours: BusinessHoursEntry[] }) {
  return <PublicBusinessHours hours={hours} />;
}
