import { useState } from 'react'

// Gambar lencana (perisai transparan yang sudah memuat tulisannya sendiri), jadi tidak dipotong bulat.
// Bila file gambar gagal dimuat, tampil lingkaran kosong supaya tata letak tidak bergeser.
export default function BadgeMedal({ image, size = 56 }) {
  const [failedImage, setFailedImage] = useState(null)

  if (!image || failedImage === image) {
    return (
      <span
        aria-hidden="true"
        className="inline-block shrink-0 rounded-full bg-stone"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <img
      src={image}
      alt=""
      width={size}
      height={size}
      onError={() => setFailedImage(image)}
      className="shrink-0 object-contain"
    />
  )
}
