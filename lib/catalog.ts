import phones from "@/data/smartphones.json";
import { validateCatalog } from "@/lib/data-validation";

export const PHONES = validateCatalog(phones);
