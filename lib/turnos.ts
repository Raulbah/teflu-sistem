// lib/utils.ts (agregado)

export type Turno = 'DIA' | 'TARDE' | 'NOCHE';

export function getTurnoActual(): { turno: Turno; fechaTurno: Date } {
    const now = new Date();
    const hours = now.getHours();
    
    // Definición de turnos
    // DIA: 06:00 - 13:59
    // TARDE: 14:00 - 21:59
    // NOCHE: 22:00 - 05:59
    
    let turno: Turno = 'NOCHE'; // Default
    let fechaTurno = new Date(now);
    fechaTurno.setHours(0, 0, 0, 0); // Normalizamos a medianoche

    if (hours >= 6 && hours < 14) {
        turno = 'DIA';
    } else if (hours >= 14 && hours < 22) {
        turno = 'TARDE';
    } else {
        turno = 'NOCHE';
        // Si son entre las 00:00 y las 05:59, el turno pertenece a la fecha de "ayer"
        if (hours < 6) {
        fechaTurno.setDate(fechaTurno.getDate() - 1);
        }
    }

    return { turno, fechaTurno };
}