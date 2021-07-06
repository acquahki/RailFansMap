declare module "@railfans/cities" {
  import type { BBox, Position } from "geojson";

  export interface Cities {
    [key: string]: Region;
  }

  export interface Region {
    readonly location: Position;
    readonly bbox: BBox;
    readonly name: string;
    agencies: Agency[];
  }

  export interface Agency {
    readonly name: string;
    readonly data: string[];
  }

  const content: Cities;
  export default content;
}
