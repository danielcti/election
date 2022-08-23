import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatTimestampDistanceFromNow = (timestamp: number): string => {
  if (!timestamp) return "";
  return ` ${formatDistanceToNow(timestamp * 1000, {
    addSuffix: true,
    locale: ptBR,
    includeSeconds: true,
  })}`;
};
