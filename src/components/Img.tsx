import { useEffect, useState, type ImgHTMLAttributes } from 'react'
import { thumb } from '../lib/images'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src: string; md?: boolean }

/** Imagen con versión mediana opcional (md) y respaldo automático a la original. */
export default function Img({ src, md = false, alt = '', ...rest }: Props) {
  const wanted = md ? thumb(src) : src
  const [s, setS] = useState(wanted)
  useEffect(() => setS(wanted), [wanted])
  return <img src={s} alt={alt} decoding="async" onError={() => { if (s !== src) setS(src) }} {...rest} />
}
