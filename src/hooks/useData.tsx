import React, { useContext } from "react";
import { FeatureCollection, Geometry } from "geojson";
import cities, { Cities, Region } from "@railfans/cities";

export interface Metadata {
  type: "rail-line" | "rail-yard";
  color?: string;
  filterKey?: string;
  offset?: number;
  id: string;
  icon?: string;
}

export interface WithMetadata {
  metadata: Metadata;
}

export type MapData = FeatureCollection<Geometry> & WithMetadata;

export interface MapDataCache {
  [key: string]: LoadedRegion;
}

export interface LoadedRegion {
  loadedData: MapData[];
  region: Region;
}

/**
 * Loads a data file from a given (url) path, and returns the data as a {@link MapData}
 * @param fileName Path to data file to load
 */
const loadData = async (fileName: string): Promise<MapData> => {
  const result = await fetch(`data/${fileName}`);
  if (!result.ok) {
    throw `Could not load ${fileName}`;
  }

  const json = await result.json();
  return json as MapData;
};

/**
 * Asynchronously loads the data for an entire region and returns a {@link LoadedRegion} with all of the region's data
 * @param region The region to load
 */
const loadRegion = async (region: Region): Promise<LoadedRegion> => {
  const promises = region.agencies
    .flatMap((agency) => agency.data)
    .map((file) => loadData(file));

  const allData = await Promise.all(promises);
  return { loadedData: allData, region };
};

const useProvideData = (): MapDataCache => {
  const [cache, setCache] = React.useState<MapDataCache>({});
  // Load in data
  React.useEffect(() => {
    Object.entries(cities).forEach(([key, value]) => {
      loadRegion(value)
        .then((loadedRegion) => {
          setCache((cache) => ({ ...cache, [key]: loadedRegion }));
        })
        .catch((err) => {
          console.error(err);
        });
    });
  }, []);

  return cache;
};

const DataContext = React.createContext<MapDataCache>({});

export const ProvideData = (props: { children: React.ReactNode }) => {
  const cache = useProvideData();

  return (
    <DataContext.Provider value={cache}>{props.children}</DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
