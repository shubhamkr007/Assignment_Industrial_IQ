import dataset from "@/data/dealership_data.json";
import type { Dataset } from "@/lib/types";

export function getDataset(): Dataset {
  return dataset as Dataset;
}
