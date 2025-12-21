'use client' 

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({error,reset,}: {error: Error & { digest?: string },reset: () => void}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <h2 className="text-xl font-semibold">Algo salió mal cargando este módulo.</h2>
            <Button onClick={() => reset()}>Intentar de nuevo</Button>
        </div>
    )
}