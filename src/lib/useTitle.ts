import { useEffect } from 'react'
export function useTitle(t: string) {
  useEffect(() => { document.title = t ? `${t} | Nikita Shoes` : 'Nikita Shoes | Zapatos de mujer' }, [t])
}
