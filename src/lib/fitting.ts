export type BoardColor = "white" | "black";
export type Orientation = "portrait" | "landscape";

export interface PhotoEdit {
  boardColor: BoardColor;
  orientation: Orientation;
}

export interface BoardDimensions {
  widthIn: number;
  heightIn: number;
  aspect: number;
}

export function boardDimensions(orientation: Orientation): BoardDimensions {
  if (orientation === "portrait") {
    return { widthIn: 6, heightIn: 8, aspect: 6 / 8 };
  }
  return { widthIn: 8, heightIn: 6, aspect: 8 / 6 };
}

export function defaultOrientation(photoAspect: number): Orientation {
  return photoAspect >= 1 ? "landscape" : "portrait";
}

export function defaultEdit(photoAspect: number): PhotoEdit {
  return {
    boardColor: "white",
    orientation: defaultOrientation(photoAspect),
  };
}
