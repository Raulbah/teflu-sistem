'use client';

import { useActionState } from 'react';
import { loginAction } from '@/server/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginForm() {
    // useActionState maneja el envío del formulario al Server Action
    // [estadoActual, funcionParaDispararElAction, estaCargando]
    const [state, action, isPending] = useActionState(loginAction, undefined);

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-slate-200">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center text-slate-800">Bienvenido</CardTitle>
                <CardDescription className="text-center">Ingresa tus credenciales corporativas</CardDescription>
            </CardHeader>
        
            <CardContent>
                <form action={action} className="space-y-4">
            
                    {/* Email Input */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            placeholder="usuario@empresa.com" 
                            required 
                            className="bg-slate-50"
                        />
                        {/* Error específico de validación Zod para email */}
                        {state?.error?.email && (
                            <p className="text-sm text-red-500">{state.error.email[0]}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input 
                            id="password" 
                            name="password" 
                            type="password" 
                            placeholder="••••••••" 
                            required 
                            className="bg-slate-50"
                        />
                        {/* Error específico de validación Zod para password */}
                        {state?.error?.password && (
                            <p className="text-sm text-red-500">{state.error.password[0]}</p>
                        )}
                    </div>

                    {/* Error General (Credenciales incorrectas) */}
                    {state?.message && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{state.message}</AlertDescription>
                        </Alert>
                    )}

                    <Button 
                        type="submit" 
                        className="w-full bg-slate-900 hover:bg-slate-800 transition-all" 
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Validando...
                            </>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </Button>
                </form>
            </CardContent>
        
            <CardFooter className="justify-center">
                <p className="text-xs text-slate-500 text-center">
                Acceso restringido a personal autorizado.
                </p>
            </CardFooter>
        </Card>
    );
}