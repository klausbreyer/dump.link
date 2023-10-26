export type Coordinates = {
  x: number;
  y: number;
};
export type BoxSide = "top" | "right" | "bottom" | "left";

export const shortenLineEnd = (
  from: Coordinates,
  to: Coordinates,
  shortenAmount: number,
): Coordinates => {
  const direction = {
    x: to.x - from.x,
    y: to.y - from.y,
  };

  const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
  const normalizedDirection = {
    x: direction.x / length,
    y: direction.y / length,
  };

  return {
    x: to.x - normalizedDirection.x * shortenAmount,
    y: to.y - normalizedDirection.y * shortenAmount,
  };
};

export const getBorderCenterCoordinates = (
  fromRect: DOMRect,
  toRect: DOMRect,
): { from: Coordinates; to: Coordinates } => {
  let from: Coordinates = { x: 0, y: 0 };
  let to: Coordinates = { x: 0, y: 0 };

  const parentElement = document.querySelector(".parent");
  if (!parentElement) {
    throw new Error("Parent element not found");
  }
  const parentRect = parentElement.getBoundingClientRect();

  const centersFrom: Record<BoxSide, Coordinates> = {
    top: { x: fromRect.left + fromRect.width / 2, y: fromRect.top },
    right: { x: fromRect.right, y: fromRect.top + fromRect.height / 2 },
    bottom: { x: fromRect.left + fromRect.width / 2, y: fromRect.bottom },
    left: { x: fromRect.left, y: fromRect.top + fromRect.height / 2 },
  };

  const centersTo: Record<BoxSide, Coordinates> = {
    top: { x: toRect.left + toRect.width / 2, y: toRect.top },
    right: { x: toRect.right, y: toRect.top + toRect.height / 2 },
    bottom: { x: toRect.left + toRect.width / 2, y: toRect.bottom },
    left: { x: toRect.left, y: toRect.top + toRect.height / 2 },
  };

  let minDistance = Infinity;
  let chosenFrom: Coordinates = { x: 0, y: 0 };
  let chosenTo: Coordinates = { x: 0, y: 0 };

  for (const sideFrom of ["top", "right", "bottom", "left"] as BoxSide[]) {
    for (const sideTo of ["top", "right", "bottom", "left"] as BoxSide[]) {
      const dist = Math.sqrt(
        Math.pow(centersFrom[sideFrom].x - centersTo[sideTo].x, 2) +
          Math.pow(centersFrom[sideFrom].y - centersTo[sideTo].y, 2),
      );

      if (dist < minDistance) {
        minDistance = dist;
        chosenFrom = centersFrom[sideFrom];
        chosenTo = centersTo[sideTo];
      }
    }
  }

  return {
    from: {
      x: chosenFrom.x - parentRect.left,
      y: chosenFrom.y - parentRect.top,
    },
    to: {
      x: chosenTo.x - parentRect.left,
      y: chosenTo.y - parentRect.top,
    },
  };
};
