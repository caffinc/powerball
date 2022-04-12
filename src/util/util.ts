var hexChar = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
];

export function byteToHex(b: number) {
  return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
}
