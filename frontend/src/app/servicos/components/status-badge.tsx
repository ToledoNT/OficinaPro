import { StatusBadgeProps } from "@/app/interfaces/service-interface";
import { STATUS_STYLES } from "../utils/service-utils";

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
};