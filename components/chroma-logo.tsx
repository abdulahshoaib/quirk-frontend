import Image from "next/image";

export function ChromaLogo({ size = 24 }) {
  return (
    <Image
      src="/icons/chroma-logo.png"
      alt="Chroma DB"
      width={size}
      height={size}
    />
  );
}
