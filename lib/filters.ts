import type { Phone, PhoneFilters } from "@/lib/types";

export function matchesFilters(phone: Phone, filters: PhoneFilters) {
  if (filters.os !== "Tous" && phone.os !== filters.os) return false;
  if (filters.formFactor !== "Tous" && phone.formFactor !== filters.formFactor) return false;
  if (filters.esimOnly && !phone.connectivity.esim) return false;
  // Un appareil 5G reste compatible avec les réseaux 4G : seul le filtre 5G est exclusif.
  if (filters.network === "5G" && phone.connectivity.network !== "5G") return false;
  if (filters.dualSimOnly && !phone.connectivity.dualSim) return false;
  return true;
}

export const filterPhones = (phones: Phone[], filters: PhoneFilters) => phones.filter((phone) => matchesFilters(phone, filters));
